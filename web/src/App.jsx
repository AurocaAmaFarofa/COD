import { useCallback, useState } from 'react'
import AppShell from './components/AppShell.jsx'
import CargaModal from './components/CargaModal.jsx'
import ConfiguracoesModal from './components/ConfiguracoesModal.jsx'
import NovaCargaModal from './components/NovaCargaModal.jsx'
import Toast from './components/Toast.jsx'
import { useCargas } from './hooks/useCargas.js'
import { useCatalogos } from './hooks/useCatalogos.js'
import { useConfiguracoes } from './hooks/useConfiguracoes.js'
import { useMe } from './hooks/useMe.js'
import { useToast } from './hooks/useToast.js'
import { usuarioPodeEditarModulo } from './utils/regras.js'
import CadastroPage from './pages/CadastroPage.jsx'
import CadastrosPage from './pages/CadastrosPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import KanbanPage from './pages/KanbanPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import PainelTV from './pages/PainelTV.jsx'

// Espelhamento: a rota /tv abre o Painel TV em tela cheia, em uma nova guia.
const ROTA_TV = window.location.pathname === '/tv'

export default function App() {
  const me = useMe()
  const cargasState = useCargas()
  const catalogosState = useCatalogos()
  const { toast, notify, dismiss } = useToast()
  const [configuracoes, setConfiguracoes] = useConfiguracoes()
  const [telaAuth, setTelaAuth] = useState('login')
  const [pagina, setPagina] = useState('kanban')
  const [novaCargaAberta, setNovaCargaAberta] = useState(false)
  const [configuracoesAbertas, setConfiguracoesAbertas] = useState(false)
  const [cargaSelecionadaId, setCargaSelecionadaId] = useState(null)

  function entrar(perfil) {
    me.definirUsuario(perfil)
    setPagina('kanban')
  }

  async function sair() {
    setCargaSelecionadaId(null)
    setNovaCargaAberta(false)
    setTelaAuth('login')
    await me.sair()
  }

  const { refresh: recarregarCargas } = cargasState
  const { refresh: recarregarCatalogos } = catalogosState
  const atualizarDados = useCallback(async () => {
    await Promise.all([recarregarCargas(), recarregarCatalogos()])
  }, [recarregarCargas, recarregarCatalogos])

  async function criarCarga(dados) {
    const carga = await cargasState.criar(dados)
    setNovaCargaAberta(false)
    setCargaSelecionadaId(carga.id)
    notify(`Nova carga ${carga.id.toUpperCase()} criada.`)
  }

  const cargaSelecionada = cargasState.cargas.find((carga) => carga.id === cargaSelecionadaId)

  if (me.loading && !me.usuario) {
    return (
      <main className="grid min-h-screen place-items-center bg-rtc-navy text-sm text-rtc-mist">
        Carregando...
      </main>
    )
  }

  if (!me.usuario) {
    return telaAuth === 'cadastro' ? (
      <CadastroPage onLogin={entrar} onIrParaLogin={() => setTelaAuth('login')} />
    ) : (
      <LoginPage
        erroInicial={me.error}
        onLogin={entrar}
        onIrParaCadastro={() => setTelaAuth('cadastro')}
      />
    )
  }

  if (ROTA_TV) {
    return (
      <PainelTV
        cargas={cargasState.cargas}
        cancelamentos={cargasState.cancelamentos}
        catalogos={catalogosState}
        onRefresh={atualizarDados}
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
        onLogout={sair}
        onRefresh={atualizarDados}
        refreshing={cargasState.loading || catalogosState.loading}
        onAbrirConfiguracoes={() => setConfiguracoesAbertas(true)}
      >
        {pagina === 'cadastros' && (
          <CadastrosPage
            catalogos={catalogosState}
            loading={catalogosState.loading}
            error={catalogosState.error}
            onRefresh={catalogosState.refresh}
            notify={notify}
          />
        )}
        {pagina === 'dashboard' && (
          <DashboardPage
            cargas={cargasState.cargas}
            cancelamentos={cargasState.cancelamentos}
            catalogos={catalogosState}
          />
        )}
        {pagina === 'kanban' && (
          <KanbanPage
            cargas={cargasState.cargas}
            catalogos={catalogosState}
            usuario={me.usuario}
            loading={cargasState.loading}
            error={cargasState.error}
            onCreate={() => setNovaCargaAberta(true)}
            onOpen={setCargaSelecionadaId}
            onMover={cargasState.mover}
            notify={notify}
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
      {configuracoesAbertas && (
        <ConfiguracoesModal
          configuracoes={configuracoes}
          onChange={setConfiguracoes}
          onClose={() => setConfiguracoesAbertas(false)}
        />
      )}
      <Toast toast={toast} onDismiss={dismiss} />
    </>
  )
}
