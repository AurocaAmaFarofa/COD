import rtcLogo from '../assets/Images/RtcLogoKanban.png'

// Moldura comum das telas de login e cadastro.
export default function AuthLayout({ titulo, subtitulo, children, rodape }) {
  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-rtc-navy px-4 py-10 text-rtc-cream">
      <div aria-hidden="true" className="ambient-orb ambient-orb--top pointer-events-none absolute -right-12 -top-20 z-0 size-96 rounded-full bg-sky-400/35 blur-3xl" />
      <div aria-hidden="true" className="ambient-orb ambient-orb--bottom pointer-events-none absolute -bottom-24 -left-16 z-0 size-96 rounded-full bg-rtc-blue/40 blur-3xl" />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-rtc-steel/50 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
        <img src={rtcLogo} alt="RTC" className="mx-auto mb-6 h-16 w-48 object-contain" />
        <h1 className="text-center text-2xl font-semibold">{titulo}</h1>
        {subtitulo && <p className="mt-2 text-center text-sm text-slate-300">{subtitulo}</p>}
        {children}
        {rodape && <div className="mt-6 text-center text-sm text-slate-300">{rodape}</div>}
      </div>
    </main>
  )
}

export function CampoAuth({ id, label, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">{label}</label>
      <input
        id={id}
        {...props}
        className="mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300 disabled:opacity-60"
      />
    </div>
  )
}

export function Divisor() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
      <span className="h-px flex-1 bg-white/15" />
      ou
      <span className="h-px flex-1 bg-white/15" />
    </div>
  )
}

export function BotaoPrincipal({ children, ...props }) {
  return (
    <button
      type="submit"
      {...props}
      className="w-full cursor-pointer rounded-xl bg-rtc-blue px-4 py-3 font-semibold text-white shadow-lg transition hover:bg-rtc-blue/85 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  )
}

export function LinkAuth({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer font-semibold text-sky-300 hover:text-sky-200 hover:underline">
      {children}
    </button>
  )
}
