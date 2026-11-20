const express = require('express')
const bcrypt = require('bcryptjs')
const { OAuth2Client } = require('google-auth-library')
const usuarios = require('../auth/usuarios')
const bloqueio = require('../auth/bloqueio')
const convite = require('../auth/convite')
const { auditar } = require('../auth/auditoria')
const { criarSessao, encerrarSessao, lerToken, revogarSessoes, verificarAcesso, exigirLogin } = require('../auth/sessao')

const router = express.Router()

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

// Mensagens genéricas (RN09): nunca revelam se o e-mail existe ou está na allowlist.
const MSG_LOGIN = 'E-mail ou senha inválidos.'
const MSG_GOOGLE = 'Não foi possível entrar com essa conta Google.'
const MSG_CADASTRO = 'Não foi possível concluir o cadastro. Verifique os dados ou fale com o administrador.'
const MSG_BLOQUEIO = 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'

// Hash fixo usado quando o e-mail não existe, para o tempo de resposta não denunciar contas.
const HASH_FALSO = bcrypt.hashSync('senha-inexistente-para-comparacao', 12)

function responderBloqueio(res, ms) {
  res.set('Retry-After', String(Math.ceil(ms / 1000)))
  return res.status(429).json({ erro: MSG_BLOQUEIO })
}

async function contarFalha(alvo, motivo) {
  await auditar('login_negado', { email: alvo.email, ip: alvo.ip, detalhes: { motivo } })
  for (const chave of bloqueio.registrarFalha(alvo)) {
    await auditar('bloqueio', { email: alvo.email, ip: alvo.ip, detalhes: { chave } })
  }
}

async function concluirLogin(req, res, usuario, metodo) {
  const acesso = await verificarAcesso(usuario)
  if (!acesso) return null
  bloqueio.limparFalhas({ email: usuario.email, ip: req.ip })
  criarSessao(res, acesso.usuario)
  await auditar('login_ok', { usuarioId: usuario.id, email: usuario.email, ip: req.ip, detalhes: { metodo } })
  return res.json({ usuario: usuarios.montarPerfil(acesso.usuario, acesso.modulos) })
}

// Regras de senha forte (as mesmas exibidas em web/src/utils/senha.js).
const REGRAS_SENHA = [
  [(s) => s.length >= 8, 'ter pelo menos 8 caracteres'],
  [(s) => /\p{Lu}/u.test(s), 'ter uma letra maiúscula'],
  [(s) => /\p{Ll}/u.test(s), 'ter uma letra minúscula'],
  [(s) => /\d/.test(s), 'ter um número'],
  [(s) => /[^\p{L}\d\s]/u.test(s), 'ter um símbolo (ex.: ! @ # $ %)'],
  [(s) => !/\s/.test(s), 'não ter espaços'],
]

function validarSenha(senha) {
  if (typeof senha !== 'string' || !senha) return 'Informe a senha.'
  if (Buffer.byteLength(senha, 'utf8') > 72) return 'A senha pode ter no máximo 72 caracteres.'
  const faltando = REGRAS_SENHA.filter(([ok]) => !ok(senha)).map(([, texto]) => texto)
  if (faltando.length) return `A senha precisa ${faltando.join(', ')}.`
  return null
}

// Configuração pública usada pela tela de login (o Client ID do Google não é segredo).
router.get('/auth/config', (req, res) => {
  res.json({ googleClientId: GOOGLE_CLIENT_ID || null })
})

// ---------------------------------------------------------------------
// Cadastro com e-mail e senha. Exige o código de convite gerado pelo admin na
// allowlist: é ele que prova que quem cadastra é o dono do e-mail.
// ---------------------------------------------------------------------
router.post('/auth/cadastro', async (req, res) => {
  const email = usuarios.normalizarEmail(req.body?.email)
  const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : ''
  const senha = req.body?.senha
  const codigoConvite = req.body?.convite
  // Contador próprio do cadastro, para não somar com as tentativas de login.
  const alvo = { ip: `cadastro:${req.ip}` }

  const espera = bloqueio.tempoBloqueado(alvo)
  if (espera) return responderBloqueio(res, espera)

  if (!nome || nome.length > 120) return res.status(400).json({ erro: 'Informe seu nome (até 120 caracteres).' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return res.status(400).json({ erro: 'Informe um e-mail válido.' })
  }
  const erroSenha = validarSenha(senha)
  if (erroSenha) return res.status(400).json({ erro: erroSenha })

  const permissao = await usuarios.buscarPermissao(email)
  const existente = await usuarios.buscarPorEmail(email)
  const conviteOk = convite.conviteValido(permissao, codigoConvite)
  if (!permissao || existente || !conviteOk) {
    let motivo = 'convite_invalido'
    if (!permissao) motivo = 'fora_da_allowlist'
    else if (existente) motivo = 'email_ja_cadastrado'
    await auditar('cadastro_negado', { email, ip: req.ip, detalhes: { motivo } })
    bloqueio.registrarFalha(alvo)
    return res.status(400).json({ erro: MSG_CADASTRO })
  }

  const usuario = await usuarios.criarUsuario({
    nome,
    email,
    senhaHash: await bcrypt.hash(senha, 12),
    modulos: permissao.modulos,
    aoCriar: (client) => convite.consumirConvite(client, email),
  })
  await auditar('cadastro', { usuarioId: usuario.id, email, ip: req.ip, detalhes: { metodo: 'senha' } })

  const resposta = await concluirLogin(req, res, usuario, 'senha')
  if (!resposta) return res.status(403).json({ erro: MSG_CADASTRO })
})

// ---------------------------------------------------------------------
// Login com e-mail e senha
// ---------------------------------------------------------------------
router.post('/auth/login', async (req, res) => {
  const email = usuarios.normalizarEmail(req.body?.email)
  const senha = typeof req.body?.senha === 'string' ? req.body.senha : ''
  // E-mail acima do tamanho da coluna não existe; recusar antes evita que a tentativa
  // escape da auditoria (o INSERT falharia).
  if (!email || !senha || email.length > 255) return res.status(400).json({ erro: 'Informe e-mail e senha.' })
  const alvo = { email, ip: req.ip }

  const espera = bloqueio.tempoBloqueado(alvo)
  if (espera) return responderBloqueio(res, espera)

  const usuario = await usuarios.buscarPorEmail(email)
  const senhaOk = await bcrypt.compare(senha.slice(0, 200), usuario?.senha_hash || HASH_FALSO)

  if (!usuario || !usuario.senha_hash || !senhaOk) {
    await contarFalha(alvo, 'credenciais_invalidas')
    return res.status(401).json({ erro: MSG_LOGIN })
  }

  const resposta = await concluirLogin(req, res, usuario, 'senha')
  if (!resposta) {
    await contarFalha(alvo, 'sem_acesso')
    return res.status(401).json({ erro: MSG_LOGIN })
  }
})

// ---------------------------------------------------------------------
// Entrar / cadastrar com Google (RF17). O front envia o ID token ("credential")
// gerado pelo botão do Google Identity Services.
// Se o e-mail estiver na allowlist e ainda não tiver conta, a conta é criada aqui.
// ---------------------------------------------------------------------
router.post('/auth/google', async (req, res) => {
  const alvo = { ip: req.ip }
  const espera = bloqueio.tempoBloqueado(alvo)
  if (espera) return responderBloqueio(res, espera)

  if (!GOOGLE_CLIENT_ID) return res.status(503).json({ erro: 'Login com Google não configurado.' })

  const credential = req.body?.credential
  if (typeof credential !== 'string' || !credential) return res.status(400).json({ erro: MSG_GOOGLE })

  let payload
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID })
    payload = ticket.getPayload()
  } catch {
    await contarFalha(alvo, 'token_google_invalido')
    return res.status(401).json({ erro: MSG_GOOGLE })
  }

  const email = usuarios.normalizarEmail(payload.email)
  alvo.email = email

  if (!payload.email_verified) {
    await contarFalha(alvo, 'email_google_nao_verificado')
    return res.status(401).json({ erro: MSG_GOOGLE })
  }

  const permissao = await usuarios.buscarPermissao(email)
  if (!permissao) {
    await contarFalha(alvo, 'fora_da_allowlist')
    return res.status(401).json({ erro: MSG_GOOGLE })
  }

  let usuario = await usuarios.buscarPorGoogleSub(payload.sub)
  if (!usuario) {
    const porEmail = await usuarios.buscarPorEmail(email)
    if (porEmail && porEmail.google_sub && porEmail.google_sub !== payload.sub) {
      await contarFalha(alvo, 'google_sub_divergente')
      return res.status(401).json({ erro: MSG_GOOGLE })
    }
    if (porEmail) {
      usuario = await usuarios.vincularGoogle(porEmail.id, { googleSub: payload.sub, fotoUrl: payload.picture })
    } else {
      usuario = await usuarios.criarUsuario({
        nome: (payload.name || email.split('@')[0]).slice(0, 120),
        email,
        googleSub: payload.sub,
        fotoUrl: payload.picture || null,
        modulos: permissao.modulos,
      })
      await auditar('cadastro', { usuarioId: usuario.id, email, ip: req.ip, detalhes: { metodo: 'google' } })
    }
  } else if (payload.picture && payload.picture !== usuario.foto_url) {
    usuario = await usuarios.vincularGoogle(usuario.id, { googleSub: payload.sub, fotoUrl: payload.picture })
  }

  const resposta = await concluirLogin(req, res, usuario, 'google')
  if (!resposta) {
    await contarFalha(alvo, 'sem_acesso')
    return res.status(401).json({ erro: MSG_GOOGLE })
  }
})

// ---------------------------------------------------------------------
// Sessão
// ---------------------------------------------------------------------
// Logout revoga o token no servidor: mesmo que alguém tenha copiado o cookie, ele para
// de funcionar. Vale para todas as sessões do usuário (todos os navegadores).
router.post('/auth/logout', async (req, res) => {
  const payload = lerToken(req)
  if (payload?.sub) {
    await revogarSessoes(payload.sub)
    await auditar('logout', { usuarioId: payload.sub, ip: req.ip })
  }
  encerrarSessao(res)
  res.status(204).end()
})

// Perfil do usuário logado e módulos que ele pode acessar (RF16).
router.get('/me', exigirLogin, (req, res) => {
  res.json(usuarios.montarPerfil(req.usuario, req.modulos))
})

module.exports = router
