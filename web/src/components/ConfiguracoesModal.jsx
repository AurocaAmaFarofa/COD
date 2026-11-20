import ModalBase from './ModalBase.jsx'

const OPCOES = [
  {
    chave: 'desligarDesfoque',
    titulo: 'Desligar desfoque de vidro',
    descricao: 'Remove o efeito de vidro dos painéis. Costuma ser o que mais consome memória e processamento.',
  },
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

function Interruptor({ ativo, onChange, rotulo }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      aria-label={rotulo}
      onClick={() => onChange(!ativo)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${ativo ? 'bg-rtc-blue' : 'bg-white/20'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ${ativo ? 'translate-x-5' : ''}`}
      />
    </button>
  )
}

export default function ConfiguracoesModal({ configuracoes, onChange, onClose }) {
  return (
    <ModalBase title="Configurações" subtitle="Reduza os efeitos se o site ficar lento ou consumir muita memória." onClose={onClose}>
      <ul className="divide-y divide-white/10">
        {OPCOES.map((opcao) => (
          <li key={opcao.chave} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="font-semibold text-white">{opcao.titulo}</p>
              <p className="mt-1 text-sm text-rtc-mist/70">{opcao.descricao}</p>
            </div>
            <Interruptor
              rotulo={opcao.titulo}
              ativo={configuracoes[opcao.chave]}
              onChange={(valor) => onChange({ ...configuracoes, [opcao.chave]: valor })}
            />
          </li>
        ))}
      </ul>
    </ModalBase>
  )
}
