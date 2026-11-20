// Bloqueio por tentativas falhas (RF18): 3 erros por conta OU por IP bloqueiam por alguns minutos.
// Guardado em memória: suficiente para uma única instância do back-end (RF06: até 4 usuários).
// Se o back-end rodar em mais de uma instância, mover para o banco ou Redis.

const MAX_TENTATIVAS = 3
const BLOQUEIO_MS = Number(process.env.LOGIN_BLOQUEIO_MINUTOS || 5) * 60 * 1000

// Teto de chaves guardadas: sem ele, um atacante mandando e-mails aleatórios faria o
// Map crescer até esgotar a memória do servidor.
const MAX_REGISTROS = 10000
// Falhas que não chegaram a bloquear expiram depois deste tempo.
const JANELA_FALHAS_MS = 15 * 60 * 1000

const registros = new Map() // chave -> { falhas, bloqueadoAte, ultimaFalha }

// Limpeza periódica: remove bloqueios vencidos e falhas antigas.
function varrer() {
  const agora = Date.now()
  for (const [chave, registro] of registros) {
    const bloqueioVencido = registro.bloqueadoAte && registro.bloqueadoAte <= agora
    const falhaAntiga = !registro.bloqueadoAte && agora - registro.ultimaFalha > JANELA_FALHAS_MS
    if (bloqueioVencido || falhaAntiga) registros.delete(chave)
  }
}
setInterval(varrer, 60 * 1000).unref()

function chaves({ email, ip }) {
  return [email && `email:${email}`, ip && `ip:${ip}`].filter(Boolean)
}

function limparExpirado(chave) {
  const registro = registros.get(chave)
  if (!registro) return
  const agora = Date.now()
  if ((registro.bloqueadoAte && registro.bloqueadoAte <= agora)
    || (!registro.bloqueadoAte && agora - registro.ultimaFalha > JANELA_FALHAS_MS)) {
    registros.delete(chave)
  }
}

// Abre espaço para uma chave nova. Primeiro descarta o que já venceu; se ainda estiver
// cheio, descarta as falhas mais antigas que não bloquearam ninguém (o Map guarda a ordem
// de inserção). Bloqueios ativos nunca são descartados.
function abrirEspaco() {
  if (registros.size < MAX_REGISTROS) return
  varrer()
  for (const [chave, registro] of registros) {
    if (registros.size < MAX_REGISTROS) break
    if (!registro.bloqueadoAte) registros.delete(chave)
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
    if (!registros.has(chave)) abrirEspaco()
    const registro = registros.get(chave) ?? { falhas: 0, bloqueadoAte: null, ultimaFalha: 0 }
    registro.falhas += 1
    registro.ultimaFalha = Date.now()
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
