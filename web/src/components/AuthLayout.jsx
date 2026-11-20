import rtcLogo from '../assets/Images/RtcLogoKanban.png'
import FractalGlass from './FractalGlass.jsx'
import { useFundoAnimado } from './FundoAmbiente.jsx'

// Layout dividido das telas de login e cadastro (referência Banano):
// painel escuro com a parede fractal à esquerda e o formulário à direita, em um cartão de vidro.
export default function AuthLayout({ titulo, subtitulo, children, rodape }) {
  const animado = useFundoAnimado()
  return (
    <main className="relative grid min-h-screen grid-cols-1 gap-6 bg-[var(--fundo-base)] p-4 text-rtc-cream sm:p-6 lg:grid-cols-2 lg:p-8">
      <aside className="relative hidden overflow-hidden rounded-[28px] bg-[#06101f] lg:block">
        <FractalGlass animado={animado} />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-[#ffffff]">
          <img src={rtcLogo} alt="" aria-hidden="true" className="h-10 w-auto object-contain" />
          <div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
              Simplifique a operação.
              <br />
              Acelere os resultados.
            </h2>
            <p className="mt-4 max-w-sm text-sm text-[#ffffff]/75">
              Acompanhe cada carga do Comercial à entrega, com permissões por módulo.
            </p>
          </div>
        </div>
      </aside>

      <section className="flex items-center justify-center">
        <div className="vidro-forte w-full max-w-md rounded-[28px] border border-[var(--vidro-borda)] p-7 shadow-xl shadow-[#0f2a4a]/10 sm:p-10">
          <img src={rtcLogo} alt="RTC" className="logo-tema mx-auto mb-6 h-12 w-40 object-contain lg:hidden" />
          <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight">{titulo}</h1>
          {subtitulo && <p className="mt-2 text-sm leading-relaxed text-slate-300">{subtitulo}</p>}
          <div className="mt-7">{children}</div>
          {rodape && <div className="mt-6 text-center text-sm text-slate-300">{rodape}</div>}
        </div>
      </section>
    </main>
  )
}

export function CampoAuth({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-slate-200">{label}</label>
      <input
        id={id}
        {...props}
        className="h-12 w-full rounded-2xl border border-[var(--vidro-borda)] bg-[var(--campo)] px-4 text-sm text-[var(--texto)] shadow-sm outline-none transition placeholder:text-slate-400 hover:border-sky-300/60 focus:border-sky-300 focus:ring-4 focus:ring-sky-300/25 disabled:opacity-60"
      />
    </div>
  )
}

export function Divisor() {
  return (
    <div className="my-6 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
      <span className="h-px flex-1 bg-[var(--vidro-borda)]" />
      ou continue com
      <span className="h-px flex-1 bg-[var(--vidro-borda)]" />
    </div>
  )
}

export function BotaoPrincipal({ children, ...props }) {
  return (
    <button
      type="submit"
      {...props}
      className="mt-2 h-12 w-full cursor-pointer rounded-2xl bg-gradient-to-r from-rtc-blue to-[#2f5f9e] text-sm font-bold text-[#ffffff] shadow-lg shadow-rtc-blue/30 transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  )
}

export function LinkAuth({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer font-bold text-sky-300 hover:text-sky-200 hover:underline">
      {children}
    </button>
  )
}
