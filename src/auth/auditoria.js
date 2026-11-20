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

module.exports = { auditar }
