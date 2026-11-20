import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import FundoAmbiente from './FundoAmbiente.jsx'

// No celular a sidebar vai para a base da tela; a partir do tablet fica à esquerda.
export default function AppShell({
  pagina,
  onNavigate,
  usuario,
  onLogout,
  onRefresh,
  refreshing,
  onAbrirConfiguracoes,
  children,
}) {
  return (
    <div className="relative isolate flex h-screen flex-col overflow-hidden font-sans text-rtc-cream md:flex-row">
      <FundoAmbiente />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-6 p-6 md:flex-row md:gap-10 md:p-10">
        <Sidebar pagina={pagina} onNavigate={onNavigate} mostrarAdmin={Boolean(usuario?.admin)} />
        <main className="vidro relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[28px] shadow-2xl shadow-black/30">
          <Topbar
            usuario={usuario}
            onLogout={onLogout}
            onRefresh={onRefresh}
            refreshing={refreshing}
            onAbrirConfiguracoes={onAbrirConfiguracoes}
          />
          <div className="scrollbar-fino min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
