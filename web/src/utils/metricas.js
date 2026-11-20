import { dataLocalISO, mesAnterior, prefixoMes } from './datas.js'

const somaFrete = (lista) => lista.reduce((total, item) => total + Number(item.frete_empresa || 0), 0)

// Indicadores do dashboard, calculados sobre as cargas em andamento e o registro de cancelamentos.
// Usa a data de embarque para os valores financeiros e a data de cancelamento para as perdidas.
export function calcularMetricas(cargas, cancelamentos, agora = new Date()) {
  const hoje = dataLocalISO(agora)
  const mesAtual = prefixoMes(agora)
  const mesPassado = prefixoMes(mesAnterior(agora))
  const diasNoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate()
  const diaAtual = agora.getDate()

  const doMes = cargas.filter((carga) => carga.dia_embarque?.startsWith(mesAtual))
  const acumulado = somaFrete(doMes)
  // Projeção linear: ritmo médio dos dias decorridos aplicado ao mês inteiro.
  const projecao = diaAtual > 0 ? (acumulado / diaAtual) * diasNoMes : 0

  const perdidasDoMes = cancelamentos.filter((item) => dataLocalISO(new Date(item.cancelado_em)).startsWith(mesAtual))

  const porDia = Array.from({ length: diasNoMes }, (_, indice) => {
    const dia = indice + 1
    const chave = `${mesAtual}-${String(dia).padStart(2, '0')}`
    const lista = doMes.filter((carga) => carga.dia_embarque === chave)
    return { dia, valor: somaFrete(lista), quantidade: lista.length }
  })

  const proximas = cargas
    .filter((carga) => carga.dia_embarque >= hoje)
    .slice()
    .sort((a, b) => a.dia_embarque.localeCompare(b.dia_embarque))
    .slice(0, 5)

  return {
    dia: somaFrete(cargas.filter((carga) => carga.dia_embarque === hoje)),
    acumulado,
    projecao,
    mesAnterior: somaFrete(cargas.filter((carga) => carga.dia_embarque?.startsWith(mesPassado))),
    cargasNoMes: doMes.length,
    perdidasNoMes: perdidasDoMes.length,
    valorPerdido: somaFrete(perdidasDoMes),
    diasNoMes,
    diaAtual,
    porDia,
    proximas,
  }
}
