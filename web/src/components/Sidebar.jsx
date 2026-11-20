import rtcLogo from '../assets/Images/RtcLogoKanban.png'
import NavItem from './NavItem.jsx'

const links = [
  { id: 'kanban', label: 'Kanban', icon: 'kanban' },
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'cadastros', label: 'Cadastros', icon: 'cadastros' },
]

// Sidebar flutuante. No desktop mostra só os ícones e expande com bounce ao passar o mouse.
// No celular vira uma barra na base da tela, só com ícones.
export default function Sidebar({ pagina, onNavigate }) {
  return (
    <aside className="group/sidebar vidro bounce-suave relative flex w-full shrink-0 flex-row items-center justify-center rounded-[28px] px-3 py-2 shadow-2xl shadow-black/30 transition-[width] duration-500 md:h-full md:w-[4.25rem] md:flex-col md:justify-start md:overflow-hidden md:px-2.5 md:py-5 md:hover:w-56">
      <img src={rtcLogo} alt="RTC" className="logo-tema mb-8 hidden h-9 w-9 object-contain md:block group-hover/sidebar:ml-1" />
      <nav aria-label="Navegação principal" className="flex w-full flex-row justify-around gap-2 md:flex-col md:justify-start">
        {links.map((link) => (
          <NavItem
            key={link.id}
            label={link.label}
            icon={link.icon}
            active={pagina === link.id}
            onClick={() => onNavigate(link.id)}
          />
        ))}
      </nav>
    </aside>
  )
}
