import PainelMetricas from '../components/PainelMetricas.jsx'

// Abre o Painel TV em uma nova guia, para espelhar na tela externa.
function abrirEspelhamento() {
  window.open(`${window.location.origin}/tv`, '_blank', 'noopener')
}

// "Olá, Nome" com o primeiro nome do usuário; sem nome, só "Olá".
function saudacao(usuario) {
  const primeiroNome = usuario?.nome?.split(' ')[0]
  return primeiroNome ? `Olá, ${primeiroNome}` : 'Olá'
}

export default function DashboardPage({ usuario, cargas, cancelamentos, catalogos }) {
  return (
    <section className="relative space-y-7">
      {/* Brilho desfocado atrás do cabeçalho, para dar profundidade ao topo da página. */}
      <div aria-hidden="true" className="luz-decorativa pointer-events-none absolute -left-16 -top-24 h-72 w-[28rem] rounded-full bg-rtc-blue/25 blur-3xl" />
      <div aria-hidden="true" className="luz-decorativa pointer-events-none absolute right-0 -top-16 h-56 w-80 rounded-full bg-sky-300/20 blur-3xl" />

      <header className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-rtc-mist/80">Visão geral da operação</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">{saudacao(usuario)}</h1>
          <p className="mt-2 text-sm text-rtc-mist/75">Fretes, embarques e cargas perdidas do mês.</p>
        </div>
        <button
          type="button"
          onClick={abrirEspelhamento}
          className="rounded-full bg-rtc-navy px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rtc-navy/25 transition hover:brightness-110"
        >
          Espelhamento
        </button>
      </header>

      <div className="relative">
        <PainelMetricas cargas={cargas} cancelamentos={cancelamentos} catalogos={catalogos} />
      </div>
    </section>
  )
}
