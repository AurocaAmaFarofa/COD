// Campo sem permissão: mesmo fundo de um campo editável, com texto mais apagado e sem borda.
// Assim o usuário vê que a informação existe, mas não pode alterá-la (RF02).
const classeBase = 'mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition'
const classeEditavel = `${classeBase} border-white/15 bg-[var(--campo)] text-white focus:border-sky-300 focus:ring-2 focus:ring-sky-300/30`
const classeBloqueada = `${classeBase} border-transparent bg-[var(--campo)] text-white/45`

function SelectField({ field, value, disabled, catalogos, carga, onChange }) {
  let options = []
  if (field.type === 'cliente') {
    options = catalogos.clientes.map((cliente) => ({ value: cliente.id, label: cliente.nome }))
  } else if (field.type === 'local') {
    options = (catalogos.clientes.find((item) => item.id === carga.cliente_id)?.locais ?? [])
      .map((local) => ({ value: local.id, label: `${local.nome} — ${local.endereco}` }))
  } else if (field.type === 'select') {
    options = field.options.map((option) => ({ value: option, label: option }))
  }

  return (
    <select
      id={field.id}
      value={value ?? ''}
      disabled={disabled}
      required={field.required}
      aria-invalid={Boolean(field.error)}
      aria-describedby={field.error ? `${field.id}-error` : undefined}
      onChange={(event) => onChange(event.target.value || null)}
      className={disabled ? classeBloqueada : classeEditavel}
    >
      <option value="">Selecione</option>
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-slate-900 text-white">
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default function CampoCarga({ field, value, disabled, catalogos, carga, onChange, error }) {
  const controlDisabled = disabled || field.readOnly || (field.type === 'local' && !carga.cliente_id)
  const controlClass = controlDisabled ? classeBloqueada : classeEditavel

  const control = ['cliente', 'local'].includes(field.type)
    || field.type === 'select'
    ? <SelectField field={{ ...field, error }} value={value} disabled={controlDisabled} catalogos={catalogos} carga={carga} onChange={onChange} />
    : field.type === 'textarea'
      ? <textarea id={field.id} value={value ?? ''} disabled={controlDisabled} required={field.required} aria-invalid={Boolean(error)} aria-describedby={error ? `${field.id}-error` : undefined} rows="3" onChange={(event) => onChange(event.target.value)} className={controlClass} />
      : <input id={field.id} type={field.type === 'currency' ? 'number' : field.type} value={value ?? ''} disabled={controlDisabled} required={field.required} aria-invalid={Boolean(error)} aria-describedby={error ? `${field.id}-error` : undefined} min={field.type === 'number' || field.type === 'currency' ? '0' : undefined} step={field.type === 'currency' || field.id === 'aliquota_icms' ? '0.01' : undefined} onChange={(event) => onChange(event.target.value)} className={controlClass} />

  return (
    <label className="block text-sm font-semibold text-rtc-mist">
      {field.label}{field.required && <span className="ml-1 text-sky-300">*</span>}
      {control}
      {error && <span id={`${field.id}-error`} role="alert" className="mt-1 block text-xs text-rose-300">{error}</span>}
    </label>
  )
}
