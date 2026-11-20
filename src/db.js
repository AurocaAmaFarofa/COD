const { Pool } = require('pg')

let url = process.env.DATABASE_URL
if (!url) {
  throw new Error('DATABASE_URL não definida no .env')
}

// Aceita a URL copiada do DBeaver/Java ("jdbc:postgresql://..."), que o driver do Node não entende.
url = url.replace(/^jdbc:/, '')

// Dentro do Docker, "localhost" é o próprio container. DB_HOST troca só o host da URL
// (o docker-compose usa host.docker.internal para chegar no Postgres instalado no Windows).
if (process.env.DB_HOST) {
  const parsed = new URL(url)
  parsed.hostname = process.env.DB_HOST
  url = parsed.toString()
}

const pool = new Pool({ connectionString: url })

async function query(text, params) {
  return pool.query(text, params)
}

// Executa fn dentro de uma transação, com rollback automático em caso de erro.
async function transacao(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const resultado = await fn(client)
    await client.query('COMMIT')
    return resultado
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = { pool, query, transacao }
