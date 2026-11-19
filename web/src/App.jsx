import { useState } from 'react'
import AppShell from './components/AppShell.jsx'
import CargaModal from './components/CargaModal.jsx'
import NovaCargaModal from './components/NovaCargaModal.jsx'
import Toast from './components/Toast.jsx'
import { useCargas } from './hooks/useCargas.js'
import { useCatalogos } from './hooks/useCatalogos.js'
import { useMe } from './hooks/useMe.js'
import { useToast } from './hooks/useToast.js'
import { useUsuarios } from './hooks/useUsuarios.js'
import { usuarioPodeEditarModulo } from './utils/regras.js'
import CadastrosPage from './pages/CadastrosPage.jsx'
import DashboardTV from './pages/DashboardTV.jsx'
import KanbanPage from './pages/KanbanPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

export default function App() {
  const me = useMe()
  const { usuarios, loading: usuariosLoading, error: usuariosError } = useUsuarios()
  const cargasState = useCargas()
  const catalogosState = useCatalogos()
  const { toast, notify, dismiss } = useToast()
  const [autenticado, setAutenticado] = useState(false)
  const [pagina, setPagina] = useState('kanban')
  const [novaCargaAberta, setNovaCargaAberta] = useState(false)
  const [cargaSelecionadaId, setCargaSelecionadaId] = useState(null)

  async function entrar(usuarioId) {
    await me.entrar(usuarioId)
    setAutenticado(true)
    setPagina('kanban')
  }

  async function trocarUsuario(usuarioId) {
    try {
      await me.entrar(usuarioId)
      notify('Perfil de demonstração atualizado.')
    } catch (error) {
      notify(error.message || 'Não foi possível trocar de perfil.', 'error')
    }
  }

  async function atualizarDados() {
    await Promise.all([cargasState.refresh(), catalogosState.refresh()])
  }

  async function criarCarga(dados) {
    const carga = await cargasState.criar(dados)
    setNovaCargaAberta(false)
    setCargaSelecionadaId(carga.id)
    notify(`Nova carga ${carga.id.toUpperCase()} criada.`)
  }

  const cargaSelecionada = cargasState.cargas.find((carga) => carga.id === cargaSelecionadaId)

  if (!autenticado) {
    return (
      <>
        <LoginPage
          usuarios={usuarios}
          loading={me.loading || usuariosLoading}
          error={me.error || usuariosError}
          onEnter={entrar}
        />
        <Toast toast={toast} onDismiss={dismiss} />
      </>
    )
  }

  if (pagina === 'tv') {
    return (
      <DashboardTV
        cargas={cargasState.cargas}
        catalogos={catalogosState}
        onRefresh={atualizarDados}
        onExit={() => setPagina('kanban')}
        loading={cargasState.loading || catalogosState.loading}
      />
    )
  }

  return (
    <>
      <AppShell
        pagina={pagina}
        onNavigate={setPagina}
        usuario={me.usuario}
        usuarios={usuarios}
        onUserChange={trocarUsuario}
        onRefresh={atualizarDados}
        refreshing={cargasState.loading || catalogosState.loading}
      >
        {pagina === 'cadastros' ? (
          <CadastrosPage
            catalogos={catalogosState}
            loading={catalogosState.loading}
            error={catalogosState.error}
            onRefresh={catalogosState.refresh}
            notify={notify}
          />
        ) : (
          <KanbanPage
            cargas={cargasState.cargas}
            catalogos={catalogosState}
            usuario={me.usuario}
            loading={cargasState.loading}
            error={cargasState.error}
            onCreate={() => setNovaCargaAberta(true)}
            onOpen={setCargaSelecionadaId}
          />
        )}
      </AppShell>
      {novaCargaAberta && usuarioPodeEditarModulo(me.usuario, 'comercial') && (
        <NovaCargaModal
          catalogos={catalogosState}
          onClose={() => setNovaCargaAberta(false)}
          onCreate={criarCarga}
        />
      )}
      {cargaSelecionada && (
        <CargaModal
          key={`${cargaSelecionada.id}-${cargaSelecionada.atualizada_em}`}
          carga={cargaSelecionada}
          usuario={me.usuario}
          catalogos={catalogosState}
          operacoes={cargasState}
          notify={notify}
          onClose={() => setCargaSelecionadaId(null)}
        />
      )}
      <Toast toast={toast} onDismiss={dismiss} />
    </>
  )
}