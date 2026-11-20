const db = require('../db')

// Registra um evento de auditoria (RF19). Falha na auditoria não derruba a requisição,
// mas fica no log do servidor. Nunca passar senha/hash/token em "detalhes".
async function auditar(evento, { usuarioId = null, email = null, ip = null, detalhes = null } = {}) {
  try {
    await db.query(
      `INSERT INTO auditoria (evento, usuario_id, email, ip, detalhes)
       VALUES ($1, $2, $3, $4, $5)`,
      [evento, usuarioId, email, ip, detalhes],
    )
  } catch (error) {
    console.error(`[auditoria] falha ao registrar "${evento}":`, error.message)
  }
}

// Ação feita por um administrador. Roda dentro da MESMA transação da alteração
// (client): se o log não puder ser gravado, a alteração é desfeita. Nada muda sem rastro.
// antes/depois guardam o estado antes e depois; motivo é o texto informado pelo admin.
async function registrarAcaoAdmin(client, {
  admin,
  evento,
  entidade,
  entidadeId,
  ip,
  antes = null,
  depois = null,
  motivo = null,
}) {
  await client.query(
    `INSERT INTO auditoria (evento, usuario_id, email, ip, entidade, entidade_id, detalhes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [evento, admin.id, admin.email, ip, entidade, String(entidadeId), { antes, depois, motivo }],
  )
}

module.exports = { auditar, registrarAcaoAdmin }
