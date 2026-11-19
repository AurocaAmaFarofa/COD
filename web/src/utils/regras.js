import { CAMPOS_CARGA } from '../config/camposCarga.js'
import { CAMPOS_OBRIGATORIOS_CARGA } from '../config/camposObrigatoriosCarga.js'
import { MODULOS } from '../config/modulos.js'

export function exigir(condicao, mensagem) {
  if (!condicao) throw new Error(mensagem)
}

export function usuarioPodeEditarModulo(usuario, modulo) {
  return Boolean(
    MODULOS.some((item) => item.id === modulo && item.habilitado) &&
      usuario?.modulos?.includes(modulo),
  )
}

export function camposObrigatoriosAusentes(dados) {
  return Object.entries(CAMPOS_OBRIGATORIOS_CARGA)
    .filter(([campo, obrigatorio]) => obrigatorio && !String(dados[campo] ?? '').trim())
    .map(([campo]) => campo)
}

function validarCamposComerciais(dados) {
  const campoAusente = camposObrigatoriosAusentes(dados)[0]
  if (campoAusente) {
    const campo = CAMPOS_CARGA.comercial.find((item) => item.id === campoAusente)
    exigir(false, `Preencha o campo "${campo?.label ?? campoAusente}".`)
  }
}

export function validarCriacaoCarga(usuario, dados) {
  exigir(usuarioPodeEditarModulo(usuario, 'comercial'), 'Somente usuários do Comercial podem criar cargas.')
  validarCamposComerciais(dados)
}

export function validarEdicaoCarga(usuario, carga, dados) {
  for (const campo of Object.keys(dados)) {
    const moduloDono = Object.keys(CAMPOS_CARGA).find((modulo) =>
      CAMPOS_CARGA[modulo].some((item) => item.id === campo),
    )
    exigir(
      moduloDono && usuarioPodeEditarModulo(usuario, moduloDono),
      `O campo "${campo}" não pertence aos módulos do seu usuário.`,
    )
  }
  if (Object.keys(dados).some((campo) => CAMPOS_OBRIGATORIOS_CARGA[campo] !== undefined)) {
    validarCamposComerciais({ ...carga, ...dados })
  }
}

export function validarCancelamento(usuario) {
  exigir(usuarioPodeEditarModulo(usuario, 'comercial'), 'Somente o Comercial pode cancelar cargas.')
}

export function validarCliente(dados, locais) {
  exigir(dados.nome?.trim(), 'Informe o nome do cliente.')
  exigir(dados.cnpj?.trim(), 'Informe o CNPJ do cliente.')
  if (dados.remetente) {
    exigir(Array.isArray(locais) && locais.some((local) => local.nome?.trim()), 'Cadastre ao menos um local de embarque para clientes remetentes.')
  }
}

