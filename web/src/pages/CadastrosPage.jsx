import { useState } from 'react'
import {
  atualizarCliente,
  criarCliente,
} from '../services/clientesService.js'

const clienteVazio = () => ({ nome: '', cnpj: '', template: '', remetente: false, destinatario: false, locais: [] })
const inputClass = 'mt-1.5 w-full rounded-lg border border-white/15 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-300'

export default function CadastrosPage({ catalogos, loading, error: catalogError, onRefresh, notify }) {
  const [editingId, setEditingId] = useState(null)
  const [cliente, setCliente] = useState(clienteVazio)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function cancelarEdicao() {
    setEditingId(null)
    setError('')
    setCliente(clienteVazio())
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await (editingId
        ? atualizarCliente(editingId, cliente)
        : criarCliente(cliente))
      await onRefresh()
      notify(editingId ? 'Cadastro atualizado.' : 'Cadastro criado.')
      cancelarEdicao()
    } catch (submitError) {
      setError(submitError.message || 'Não foi possível salvar o cadastro.')
    } finally {
      setSaving(false)
    }
  }

  function editarCliente(item) {
    setEditingId(item.id)
    setCliente({
      nome: item.nome,
      cnpj: item.cnpj,
      template: item.template ?? '',
      remetente: item.remetente ?? false,
      destinatario: item.destinatario ?? false,
      locais: item.locais.map(({ id, nome, endereco, padrao }) => ({ id, nome, endereco, padrao })),
    })
  }

  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium text-sky-300">Base operacional</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">Cadastros</h1>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(300px,0.8fr)_1.2fr]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/25 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-white">{editingId ? 'Editar cliente' : 'Novo cadastro · Clientes'}</h2>
            {editingId && <button type="button" onClick={cancelarEdicao} className="text-xs text-slate-400 hover:text-white">Cancelar edição</button>}
          </div>

          <label className="block text-sm text-slate-200">Nome do cliente *<input required value={cliente.nome} onChange={(event) => setCliente({ ...cliente, nome: event.target.value })} className={inputClass} /></label>
          <label className="block text-sm text-slate-200">CNPJ *<input required value={cliente.cnpj} onChange={(event) => setCliente({ ...cliente, cnpj: event.target.value })} className={inputClass} placeholder="00.000.000/0000-00" /></label>
          <label className="block text-sm text-slate-200">Template padrão<textarea value={cliente.template} onChange={(event) => setCliente({ ...cliente, template: event.target.value })} rows="2" className={inputClass} /></label>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-200">Tipo do cliente</legend>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={cliente.destinatario} onChange={(event) => setCliente({ ...cliente, destinatario: event.target.checked })} className="h-4 w-4 rounded border-white/15 bg-slate-950 accent-sky-300" />
              Destinatário (quem recebe)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={cliente.remetente} onChange={(event) => setCliente({ ...cliente, remetente: event.target.checked })} className="h-4 w-4 rounded border-white/15 bg-slate-950 accent-sky-300" />
              Remetente (quem envia)
            </label>
          </fieldset>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-200">Locais de embarque {cliente.remetente ? '*' : ''}</p>
              <button type="button" onClick={() => setCliente({ ...cliente, locais: [...cliente.locais, { nome: '', endereco: '', padrao: '' }] })} className="text-xs font-medium text-sky-300 hover:text-sky-200">+ Adicionar local</button>
            </div>
            {cliente.locais.map((local, index) => (
              <div key={index} className="rounded-xl border border-white/10 p-3">
                <label className="block text-xs text-slate-300">Nome do local {cliente.remetente ? '*' : ''}<input required={cliente.remetente} value={local.nome} onChange={(event) => setCliente({ ...cliente, locais: cliente.locais.map((item, i) => i === index ? { ...item, nome: event.target.value } : item) })} className={inputClass} /></label>
                <label className="mt-3 block text-xs text-slate-300">Endereço<input value={local.endereco} onChange={(event) => setCliente({ ...cliente, locais: cliente.locais.map((item, i) => i === index ? { ...item, endereco: event.target.value } : item) })} className={inputClass} /></label>
                <label className="mt-3 block text-xs text-slate-300">Padrão deste local<input value={local.padrao} onChange={(event) => setCliente({ ...cliente, locais: cliente.locais.map((item, i) => i === index ? { ...item, padrao: event.target.value } : item) })} className={inputClass} /></label>
                {cliente.locais.length > 1 && <button type="button" onClick={() => setCliente({ ...cliente, locais: cliente.locais.filter((_, i) => i !== index) })} className="mt-2 text-xs text-rose-300 hover:text-rose-200">Remover local</button>}
              </div>
            ))}
          </div>

          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <button type="submit" disabled={saving} className="w-full rounded-xl bg-sky-300 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-200 disabled:opacity-60">{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar cliente'}</button>
        </form>

        <section className="rounded-2xl border border-white/10 bg-slate-950/20 p-5">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Clientes cadastrados</h2>
              <p className="mt-1 text-xs text-slate-400">{loading ? 'Carregando...' : 'Selecione um registro para editar.'}</p>
            </div>
            <button type="button" onClick={onRefresh} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-300 hover:bg-white/10">Atualizar lista</button>
          </header>
          {(catalogError || error) && <p role="alert" className="mb-3 text-sm text-rose-300">{catalogError}</p>}
          <div className="space-y-2">
            {catalogos.clientes.map((item) => (
              <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-3">
                <div><p className="text-sm font-medium text-white">{item.nome}</p><p className="mt-1 text-xs text-slate-400">{item.cnpj} · {item.locais.length} local(is)</p></div>
                <button type="button" onClick={() => editarCliente(item)} className="rounded-lg px-3 py-1.5 text-xs text-sky-200 hover:bg-sky-300/10">Editar</button>
              </article>
            ))}
            {!loading && !catalogos.clientes.length && <p className="py-8 text-center text-sm text-slate-500">Nenhum cliente cadastrado.</p>}
          </div>
        </section>
      </div>
    </section>
  )
}
