// Bloqueio por tentativas falhas (RF18): 3 erros por conta OU por IP bloqueiam por alguns minutos.
// Guardado em memória: suficiente para uma única instância do back-end (RF06: até 4 usuários).
// Se o back-end rodar em mais de uma instância, mover para o banco ou Redis.

const MAX_TENTATIVAS = 3
const BLOQUEIO_MS = Number(process.env.LOGIN_BLOQUEIO_MINUTOS || 5) * 60 * 1000

const registros = new Map() // chave -> { falhas, bloqueadoAte }

function chaves({ email, ip }) {
  return [email && `email:${email}`, ip && `ip:${ip}`].filter(Boolean)
}

function limparExpirado(chave) {
  const registro = registros.get(chave)
  if (registro?.bloqueadoAte && registro.bloqueadoAte <= Date.now()) {
    registros.delete(chave)
  }
}

// Retorna em quantos ms o bloqueio termina (0 = liberado).
function tempoBloqueado(alvo) {
  let restante = 0
  for (const chave of chaves(alvo)) {
    limparExpirado(chave)
    const registro = registros.get(chave)
    if (registro?.bloqueadoAte) restante = Math.max(restante, registro.bloqueadoAte - Date.now())
  }
  return restante
}

// Conta uma falha. Retorna as chaves que acabaram de ser bloqueadas (para auditoria).
function registrarFalha(alvo) {
  const bloqueadas = []
  for (const chave of chaves(alvo)) {
    limparExpirado(chave)
    const registro = registros.get(chave) ?? { falhas: 0, bloqueadoAte: null }
    registro.falhas += 1
    if (registro.falhas >= MAX_TENTATIVAS && !registro.bloqueadoAte) {
      registro.bloqueadoAte = Date.now() + BLOQUEIO_MS
      bloqueadas.push(chave)
    }
    registros.set(chave, registro)
  }
  return bloqueadas
}

function limparFalhas(alvo) {
  for (const chave of chaves(alvo)) registros.delete(chave)
}

module.exports = { tempoBloqueado, registrarFalha, limparFalhas }
