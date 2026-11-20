const db = require('../db')

function normalizarEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

async function buscarPermissao(email) {
  const { rows } = await db.query('SELECT email, modulos, convite_hash, convite_expira_em FROM usuarios_permitidos WHERE email = $1', [email])
  return rows[0] ?? null
}

async function buscarPorEmail(email) {
  const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email])
  return rows[0] ?? null
}

async function buscarPorGoogleSub(sub) {
  const { rows } = await db.query('SELECT * FROM usuarios WHERE google_sub = $1', [sub])
  return rows[0] ?? null
}

async function buscarPorId(id) {
  const { rows } = await db.query('SELECT * FROM usuarios WHERE id = $1', [id])
  return rows[0] ?? null
}

// Cria o usuário e os vínculos usuario_modulo definidos na allowlist, numa única transação.
// aoCriar(client, usuario) roda dentro da mesma transação (ex.: consumir o convite).
async function criarUsuario({ nome, email, senhaHash = null, googleSub = null, fotoUrl = null, modulos, aoCriar }) {
  return db.transacao(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO usuarios (nome, email, senha_hash, google_sub, foto_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, email, senhaHash, googleSub, fotoUrl],
    )
    const usuario = rows[0]
    await client.query(
      `INSERT INTO usuario_modulo (usuario_id, modulo_id)
       SELECT $1, id FROM modulos WHERE codigo = ANY ($2::varchar[])
       ON CONFLICT DO NOTHING`,
      [usuario.id, modulos],
    )
    if (aoCriar) await aoCriar(client, usuario)
    return usuario
  })
}

async function vincularGoogle(usuarioId, { googleSub, fotoUrl }) {
  const { rows } = await db.query(
    `UPDATE usuarios
        SET google_sub = COALESCE(google_sub, $2),
            foto_url = COALESCE($3, foto_url),
            atualizado_em = now()
      WHERE id = $1
      RETURNING *`,
    [usuarioId, googleSub, fotoUrl],
  )
  return rows[0]
}

// Módulos com vínculo ativo do usuário (inclusive os ainda desligados no sistema).
async function listarModulos(usuarioId) {
  const { rows } = await db.query(
    `SELECT m.codigo, m.nome, m.ordem, m.habilitado
       FROM usuario_modulo um
       JOIN modulos m ON m.id = um.modulo_id
      WHERE um.usuario_id = $1 AND um.ativo
      ORDER BY m.ordem`,
    [usuarioId],
  )
  return rows
}

function iniciais(nome) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}

// Formato entregue ao front em GET /me (RF16). Os ids dos módulos seguem web/src/config/modulos.js.
function montarPerfil(usuario, modulos) {
  return {
    id: String(usuario.id),
    nome: usuario.nome,
    email: usuario.email,
    foto_url: usuario.foto_url,
    admin: usuario.papel === 'admin',
    avatar: iniciais(usuario.nome),
    modulos: modulos.map((modulo) => modulo.codigo.toLowerCase()),
    modulos_detalhe: modulos.map((modulo) => ({
      id: modulo.codigo.toLowerCase(),
      nome: modulo.nome,
      ordem: modulo.ordem,
      habilitado: modulo.habilitado,
    })),
  }
}

module.exports = {
  normalizarEmail,
  buscarPermissao,
  buscarPorEmail,
  buscarPorGoogleSub,
  buscarPorId,
  criarUsuario,
  vincularGoogle,
  listarModulos,
  montarPerfil,
}
