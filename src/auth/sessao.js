const jwt = require('jsonwebtoken')
const usuarios = require('./usuarios')

const COOKIE = 'rtc_sessao'
const DURACAO_HORAS = Number(process.env.SESSAO_HORAS || 8)

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

function criarSessao(res, usuarioId) {
  const token = jwt.sign({ sub: String(usuarioId) }, process.env.JWT_SECRET, {
    expiresIn: `${DURACAO_HORAS}h`,
  })
  res.cookie(COOKIE, token, { ...opcoesCookie(), maxAge: DURACAO_HORAS * 3600 * 1000 })
}

function encerrarSessao(res) {
  res.clearCookie(COOKIE, opcoesCookie())
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
    const token = req.cookies?.[COOKIE]
    if (!token) return res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' })

    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      encerrarSessao(res)
      return res.status(401).json({ erro: 'Sessão expirada. Entre novamente.' })
    }

    const acesso = await verificarAcesso(await usuarios.buscarPorId(payload.sub))
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

module.exports = { criarSessao, encerrarSessao, verificarAcesso, exigirLogin }
