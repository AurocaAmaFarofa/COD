export default function ModalBase({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
      <section className={`cartao-forte flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl border border-white/15 bg-slate-900/95 text-white shadow-2xl shadow-black/50 ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-rtc-mist/70">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-9 place-items-center rounded-full bg-white/10 text-xl leading-none text-rtc-mist transition hover:bg-white/20 hover:text-white">×</button>
        </header>
        <div className="overflow-y-auto px-5 py-5 sm:px-7">{children}</div>
      </section>
    </div>
  )
}
