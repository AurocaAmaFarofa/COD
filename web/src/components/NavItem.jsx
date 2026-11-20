function NavIcon({ name }) {
  const common = {
    'aria-hidden': true,
    className: 'size-5 shrink-0',
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (name === 'kanban') {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="7" height="18" rx="1.5" />
        <rect x="14" y="3" width="7" height="11" rx="1.5" />
        <path d="M14 18h7" />
      </svg>
    )
  }
  if (name === 'dashboard') {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="8" height="9" rx="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" />
        <rect x="3" y="14" width="8" height="7" rx="1.5" />
      </svg>
    )
  }
  if (name === 'admin') {
    return (
      <svg {...common}>
        <path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M8 4h11a2 2 0 0 1 2 2v14H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1" />
      <path d="M8 2h7v5H8zM8 12h9M8 16h9" />
    </svg>
  )
}

export default function NavItem({ label, icon, active, onClick }) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      title={label}
      className={`group relative flex h-11 w-full items-center gap-3 overflow-hidden rounded-2xl px-2.5 text-left text-sm font-semibold transition-all duration-300 hover:bg-white/10 ${
        active
          ? 'bg-gradient-to-r from-rtc-blue to-rtc-blue/60 text-white shadow-lg shadow-rtc-navy/40'
          : 'text-rtc-mist/80 hover:text-white'
      }`}
    >
      <NavIcon name={icon} />
      <span className="max-md:hidden whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
        {label}
      </span>
    </button>
  )
}
