// Card de indicador. O destaque usa gradiente azul; os demais ficam em vidro.
export default function KpiCard({ titulo, valor, detalhe, icone, destaque = false }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-3xl p-5 shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 ${
        destaque
          ? 'bg-gradient-to-br from-rtc-blue via-rtc-blue/80 to-rtc-navy text-white'
          : 'vidro text-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-xs font-bold uppercase tracking-[0.14em] ${destaque ? 'text-white/80' : 'text-rtc-mist/70'}`}>{titulo}</p>
        <span className={`grid size-9 shrink-0 place-items-center rounded-2xl ${destaque ? 'bg-white/20' : 'bg-white/10 text-sky-200'}`}>
          {icone}
        </span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight tabular-nums sm:text-[2rem]">{valor}</p>
      {detalhe && <p className={`mt-2 text-xs ${destaque ? 'text-white/75' : 'text-rtc-mist/65'}`}>{detalhe}</p>}
      <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-white/[0.07] transition group-hover:scale-125" />
    </article>
  )
}
