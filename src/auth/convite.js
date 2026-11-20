const crypto = require('crypto')

// Código de convite para o cadastro com senha (correção da tomada de conta antecipada).
// Sem ele, qualquer pessoa que soubesse um e-mail da allowlist poderia criar a conta
// daquele e-mail com uma senha própria, antes do dono de verdade.
// O admin gera o código ao liberar o e-mail e o entrega à pessoa por um canal dele.
// No banco fica só o hash SHA-256; o código aparece uma única vez, na tela do admin.

const VALIDADE_DIAS = Number(process.env.CONVITE_VALIDADE_DIAS || 7)
// Sem letras/números parecidos (0/O, 1/I/L) para ditar o código sem erro.
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function gerarCodigo() {
  const bytes = crypto.randomBytes(10)
  let codigo = ''
  for (const byte of bytes) codigo += ALFABETO[byte % ALFABETO.length]
  return `${codigo.slice(0, 5)}-${codigo.slice(5)}`
}

function normalizar(codigo) {
  return typeof codigo === 'string' ? codigo.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 40) : ''
}

function hashCodigo(codigo) {
  return crypto.createHash('sha256').update(normalizar(codigo)).digest('hex')
}

// Gera um novo convite para o e-mail (substitui o anterior). Retorna o código em texto,
// que deve ser mostrado ao admin e nunca gravado em log.
async function criarConvite(client, email) {
  const codigo = gerarCodigo()
  const { rows } = await client.query(
    `UPDATE usuarios_permitidos
        SET convite_hash = $2, convite_expira_em = now() + make_interval(days => $3)
      WHERE email = $1
      RETURNING convite_expira_em`,
    [email, hashCodigo(codigo), VALIDADE_DIAS],
  )
  if (!rows[0]) return null
  return { codigo, expiraEm: rows[0].convite_expira_em }
}

// Confere o código em tempo constante. permissao = linha de usuarios_permitidos.
function conviteValido(permissao, codigo) {
  if (!permissao?.convite_hash || !permissao.convite_expira_em) return false
  if (new Date(permissao.convite_expira_em) <= new Date()) return false
  if (normalizar(codigo).length < 10) return false
  const esperado = Buffer.from(permissao.convite_hash, 'hex')
  const recebido = Buffer.from(hashCodigo(codigo), 'hex')
  return esperado.length === recebido.length && crypto.timingSafeEqual(esperado, recebido)
}

// Convite é de uso único: some assim que a conta é criada.
async function consumirConvite(client, email) {
  await client.query(
    'UPDATE usuarios_permitidos SET convite_hash = NULL, convite_expira_em = NULL WHERE email = $1',
    [email],
  )
}

module.exports = { criarConvite, conviteValido, consumirConvite }
