// Ícone do clima a partir da categoria (sol, nuvem, chuva, neve, tempestade, nevoeiro).
export default function ClimaIcon({ categoria = 'nuvem', className = 'size-5' }) {
  const base = {
    'aria-hidden': true,
    className,
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (categoria === 'sol') {
    return (
      <svg {...base}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    )
  }
  if (categoria === 'chuva') {
    return (
      <svg {...base}>
        <path d="M7 15a4 4 0 0 1 .5-7.96A5.5 5.5 0 0 1 18 8.5a3.5 3.5 0 0 1 0 6.5H7z" />
        <path d="m8 18-1 2M12 18l-1 2M16 18l-1 2" />
      </svg>
    )
  }
  if (categoria === 'neve') {
    return (
      <svg {...base}>
        <path d="M7 15a4 4 0 0 1 .5-7.96A5.5 5.5 0 0 1 18 8.5a3.5 3.5 0 0 1 0 6.5H7z" />
        <path d="m9 18 .01 0M12 20l.01 0M15 18l.01 0" />
      </svg>
    )
  }
  if (categoria === 'tempestade') {
    return (
      <svg {...base}>
        <path d="M7 15a4 4 0 0 1 .5-7.96A5.5 5.5 0 0 1 18 8.5a3.5 3.5 0 0 1 0 6.5H7z" />
        <path d="m12 14-2 4h3l-2 4" />
      </svg>
    )
  }
  if (categoria === 'nevoeiro') {
    return (
      <svg {...base}>
        <path d="M4 9h16M6 13h12M4 17h16" />
      </svg>
    )
  }
  return (
    <svg {...base}>
      <path d="M7 18a4 4 0 0 1 .5-7.96A5.5 5.5 0 0 1 18 11.5a3.5 3.5 0 0 1 0 6.5H7z" />
    </svg>
  )
}
