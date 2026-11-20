import rtcLogo from '../assets/Images/RtcLogoKanban.png'
import FractalGlass from './FractalGlass.jsx'
import BotaoTema from './BotaoTema.jsx'

// Layout dividido das telas de login e cadastro (referência Banano):
// painel escuro com a parede fractal à esquerda e o formulário à direita.
export default function AuthLayout({ titulo, subtitulo, children, rodape }) {
  return (
    <main className="relative grid min-h-screen grid-cols-1 gap-6 bg-[var(--fundo-base)] p-4 text-rtc-cream sm:p-6 lg:grid-cols-2 lg:p-8">
      <BotaoTema className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6 lg:right-8 lg:top-8" />
      <aside className="relative hidden overflow-hidden rounded-[28px] bg-[#06101f] lg:block">
        <FractalGlass />
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

      <section className="flex items-center justify-center py-6 lg:py-0">
        <div className="w-full max-w-md">
          <img src={rtcLogo} alt="RTC" className="logo-tema mx-auto mb-8 h-14 w-44 object-contain lg:hidden" />
          <h1 className="text-3xl font-extrabold tracking-tight">{titulo}</h1>
          {subtitulo && <p className="mt-2 text-sm text-slate-300">{subtitulo}</p>}
          <div className="mt-8">{children}</div>
          {rodape && <div className="mt-6 text-center text-sm text-slate-300">{rodape}</div>}
        </div>
      </section>
    </main>
  )
}

export function CampoAuth({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-200">{label}</label>
      <input
        id={id}
        {...props}
        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-[var(--campo)] px-3 py-3 text-sm text-[var(--texto)] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/30 disabled:opacity-60"
      />
    </div>
  )
}

export function Divisor() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
      <span className="h-px flex-1 bg-slate-300" />
      ou continue com
      <span className="h-px flex-1 bg-slate-300" />
    </div>
  )
}

export function BotaoPrincipal({ children, ...props }) {
  return (
    <button
      type="submit"
      {...props}
      className="w-full cursor-pointer rounded-xl bg-rtc-blue px-4 py-3.5 font-bold text-[#ffffff] shadow-lg shadow-rtc-blue/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
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
