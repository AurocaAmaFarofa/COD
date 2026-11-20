import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

export default function AppShell({
  pagina,
  onNavigate,
  usuario,
  onLogout,
  onRefresh,
  refreshing,
  children,
}) {
  return (
    <div className="relative isolate flex h-screen overflow-hidden bg-rtc-navy font-sans text-rtc-cream">
      <div
        aria-hidden="true"
        className="ambient-orb ambient-orb--top pointer-events-none absolute -right-8 -top-10 z-0 size-80 rounded-full bg-sky-400/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="ambient-orb ambient-orb--bottom pointer-events-none absolute -bottom-24 -left-16 z-0 size-80 rounded-full bg-rtc-blue/40 blur-3xl"
      />
      <Sidebar pagina={pagina} onNavigate={onNavigate} />
      <main
        className="
          relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden
          rounded-l-3xl
          border border-white/15
          bg-white/[0.01]
          shadow-2xl shadow-black/20
          backdrop-blur-2xl
          ring-1 ring-inset ring-white/[0.04]
        "
      >
        <Topbar
          usuario={usuario}
          onLogout={onLogout}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
