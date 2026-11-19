export default function ModalBase({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm sm:p-6">
      <section className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-900 text-white shadow-2xl ${wide ? 'max-w-5xl' : 'max-w-2xl'}`}>
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg px-3 py-1 text-2xl leading-none text-slate-400 hover:bg-white/10 hover:text-white">×</button>
        </header>
        <div className="overflow-y-auto px-5 py-5 sm:px-7">{children}</div>
      </section>
    </div>
  )
}
