const jwt = require('jsonwebtoken')
const db = require('../db')
const usuarios = require('./usuarios')

const COOKIE = 'rtc_sessao'
const DURACAO_HORAS = Number(process.env.SESSAO_HORAS || 8)
// Algoritmo fixo: o servidor nunca aceita um token assinado de outra forma.
const ALGORITMO = 'HS256'

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET ausente ou curto demais (mínimo 32 caracteres) no .env')
}

function opcoesCookie() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}

// "v" é a versão do token do usuário (usuarios.token_versao). Quando ela sobe, todos os
// tokens emitidos antes deixam de valer: é assim que o logout e o desligamento revogam sessões.
function criarSessao(res, usuario) {
  const token = jwt.sign({ sub: String(usuario.id), v: usuario.token_versao ?? 0 }, process.env.JWT_SECRET, {
    algorithm: ALGORITMO,
    expiresIn: `${DURACAO_HORAS}h`,
  })
  res.cookie(COOKIE, token, { ...opcoesCookie(), maxAge: DURACAO_HORAS * 3600 * 1000 })
}

function encerrarSessao(res) {
  res.clearCookie(COOKIE, opcoesCookie())
}

function lerToken(req) {
  const token = req.cookies?.[COOKIE]
  if (!token) return null
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { algorithms: [ALGORITMO] })
  } catch {
    return null
  }
}

// Invalida todas as sessões abertas do usuário (em qualquer navegador).
// Aceita um client de transação para rodar junto com outra alteração.
async function revogarSessoes(usuarioId, client = db) {
  await client.query('UPDATE usuarios SET token_versao = token_versao + 1 WHERE id = $1', [usuarioId])
}

// Confere se o usuário ainda pode acessar: conta ativa, e-mail na allowlist e ao menos
// um módulo ativo (RF15). Retorna { usuario, modulos } ou null.
async function verificarAcesso(usuario) {
  if (!usuario?.ativo) return null
  if (!(await usuarios.buscarPermissao(usuario.email))) return null
  const modulos = await usuarios.listarModulos(usuario.id)
  if (!modulos.length) return null
  return { usuario, modulos }
}

// Middleware: exige sessão válida. Revalida no banco a cada requisição, então tirar o
// e-mail da allowlist ou desativar a conta corta o acesso na hora.
async function exigirLogin(req, res, next) {
  try {
    const payload = lerToken(req)
    if (!payload) {
      encerrarSessao(res)
      return res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' })
    }

    const usuario = await usuarios.buscarPorId(payload.sub)
    // Token de uma versão antiga (logout, desativação ou troca de papel depois que ele foi emitido).
    const versaoOk = usuario && payload.v === usuario.token_versao
    const acesso = versaoOk ? await verificarAcesso(usuario) : null
    if (!acesso) {
      encerrarSessao(res)
      return res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' })
    }

    req.usuario = acesso.usuario
    req.modulos = acesso.modulos
    next()
  } catch (error) {
    next(error)
  }
}

// Middleware: só administradores passam. Usar sempre depois de exigirLogin.
// A checagem é feita no servidor; esconder o menu no front não basta.
function exigirAdmin(req, res, next) {
  if (req.usuario?.papel !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores.' })
  }
  next()
}

module.exports = { criarSessao, encerrarSessao, lerToken, revogarSessoes, verificarAcesso, exigirLogin, exigirAdmin }
