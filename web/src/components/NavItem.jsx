function NavIcon({ name }) {
  const common = {
    'aria-hidden': true,
    className: 'relative z-10 size-5 shrink-0',
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
  if (name === 'cadastros') {
    return (
      <svg {...common}>
        <path d="M8 4h11a2 2 0 0 1 2 2v14H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1" />
        <path d="M8 2h7v5H8zM8 12h9M8 16h9" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="m8 21 4-4 4 4M12 17v4" />
    </svg>
  )
}

export default function NavItem({ label, icon, active, compact, onClick }) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      title={compact ? label : undefined}
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left text-sm font-medium text-white transition-shadow duration-300 hover:shadow-md hover:shadow-rtc-blue/20 ${
        active ? 'shadow-lg shadow-rtc-blue/25' : ''
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-r from-sky-200 via-rtc-blue/70 to-transparent transition-opacity duration-500 ease-in-out ${
          active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
        }`}
      />
      <NavIcon name={icon} />
      <span className={compact ? 'hidden sm:inline' : ''}>{label}</span>
    </button>
  )
}