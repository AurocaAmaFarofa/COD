import rtcLogo from '../assets/Images/RtcLogoKanban.png'
import NavItem from './NavItem.jsx'

const links = [
  { id: 'kanban', label: 'Operação', icon: 'kanban' },
  { id: 'cadastros', label: 'Cadastros', icon: 'cadastros' },
  { id: 'tv', label: 'Painel TV', icon: 'tv' },
]

export default function Sidebar({ pagina, onNavigate }) {
  return (
    <aside className="relative z-10 flex h-full w-[4.5rem] shrink-0 flex-col px-2 py-4 sm:w-56 sm:px-3 sm:py-5">
      <img src={rtcLogo} alt="RTC" className="mb-8 h-10 w-10 object-contain sm:h-16 sm:w-48" />
      <nav aria-label="Navegação principal" className="flex flex-col gap-2">
        {links.map((link) => (
          <NavItem
            key={link.id}
            label={link.label}
            icon={link.icon}
            compact
            active={pagina === link.id || (pagina !== 'kanban' && pagina !== 'tv' && link.id === 'cadastros')}
            onClick={() => onNavigate(link.id)}
          />
        ))}
      </nav>
      <div className="mt-auto hidden rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400 sm:block">
        RTC · Gestão de cargas
        <p className="mt-1 text-slate-500">Ambiente de demonstração</p>
      </div>
    </aside>
  )
}