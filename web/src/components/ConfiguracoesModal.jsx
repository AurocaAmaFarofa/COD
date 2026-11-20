import ModalBase from './ModalBase.jsx'

// Ajustes finos: só valem com o modo leve desligado (o modo leve já liga os dois).
const OPCOES = [
  {
    chave: 'fundoEstatico',
    titulo: 'Fundo sem movimento',
    descricao: 'Mostra o fundo fractal parado, sem a animação de vidro.',
  },
  {
    chave: 'desligarAnimacoes',
    titulo: 'Desligar animações',
    descricao: 'Remove o bounce da sidebar e as transições da interface.',
  },
]

function Interruptor({ ativo, onChange, rotulo, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      aria-label={rotulo}
      disabled={disabled}
      onClick={() => onChange(!ativo)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${ativo ? 'bg-rtc-blue' : 'bg-white/20'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ${ativo ? 'translate-x-5' : ''}`}
      />
    </button>
  )
}

export default function ConfiguracoesModal({ configuracoes, onChange, onClose }) {
  const { modoLeve } = configuracoes
  return (
    <ModalBase title="Configurações" subtitle="Escolha entre um site mais leve ou com o visual completo." onClose={onClose}>
      <ul className="divide-y divide-white/10">
        <li className="flex items-center justify-between gap-4 py-4">
          <div>
            <p className="font-semibold text-white">Modo leve <span className="text-xs font-normal text-rtc-mist/70">(recomendado)</span></p>
            <p className="mt-1 text-sm text-rtc-mist/70">
              Deixa o site mais rápido e econômico: fundo parado, sem desfoque de vidro e sem animações.
              Desligue para ver o visual completo.
            </p>
          </div>
          <Interruptor
            rotulo="Modo leve"
            ativo={modoLeve}
            onChange={(valor) => onChange({ ...configuracoes, modoLeve: valor })}
          />
        </li>
        {OPCOES.map((opcao) => (
          <li key={opcao.chave} className={`flex items-center justify-between gap-4 py-4 ${modoLeve ? 'opacity-60' : ''}`}>
            <div>
              <p className="font-semibold text-white">{opcao.titulo}</p>
              <p className="mt-1 text-sm text-rtc-mist/70">
                {modoLeve ? 'Já incluído no modo leve.' : opcao.descricao}
              </p>
            </div>
            <Interruptor
              rotulo={opcao.titulo}
              disabled={modoLeve}
              ativo={modoLeve || configuracoes[opcao.chave]}
              onChange={(valor) => onChange({ ...configuracoes, [opcao.chave]: valor })}
            />
          </li>
        ))}
      </ul>
    </ModalBase>
  )
}
