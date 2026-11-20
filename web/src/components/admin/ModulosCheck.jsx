// Lista de módulos com caixas de seleção. Recebe e devolve códigos em maiúsculas (formato do banco).
export default function ModulosCheck({ catalogo, selecionados, onChange, disabled = false }) {
  function alternar(codigo) {
    onChange(
      selecionados.includes(codigo)
        ? selecionados.filter((item) => item !== codigo)
        : [...selecionados, codigo],
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {catalogo.map((modulo) => {
        const marcado = selecionados.includes(modulo.codigo)
        return (
          <label
            key={modulo.codigo}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              marcado ? 'border-sky-300 bg-sky-300/20 text-white' : 'border-white/15 text-rtc-mist'
            } ${disabled ? 'opacity-50' : 'hover:border-sky-300'}`}
          >
            <input
              type="checkbox"
              className="accent-sky-400"
              checked={marcado}
              disabled={disabled}
              onChange={() => alternar(modulo.codigo)}
            />
            {modulo.nome}
          </label>
        )
      })}
    </div>
  )
}
