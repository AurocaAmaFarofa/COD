const express = require('express')
const db = require('../db')
const { exigirLogin, exigirAdmin, revogarSessoes } = require('../auth/sessao')
const convite = require('../auth/convite')
const { registrarAcaoAdmin } = require('../auth/auditoria')

// Toda rota desta página exige login E papel de administrador (checado no servidor).
const router = express.Router()
router.use(exigirLogin, exigirAdmin)

const PAPEIS = ['usuario', 'admin']
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Tabelas que a tela "Dados" pode ler. Consulta fixa por tabela: nada de SQL vindo do cliente.
// Campos sensíveis (senha_hash, google_sub) nunca entram no SELECT.
const TABELAS = {
  usuarios: {
    titulo: 'Usuários',
    sql: `SELECT id, nome, email, papel, ativo, (google_sub IS NOT NULL) AS google_vinculado,
                 (senha_hash IS NOT NULL) AS tem_senha, criado_em, atualizado_em
            FROM usuarios`,
    ordem: 'id',
  },
  usuario_modulo: {
    titulo: 'Módulos por usuário',
    sql: `SELECT um.usuario_id, u.email, m.codigo AS modulo, um.ativo, um.criado_em
            FROM usuario_modulo um
            JOIN usuarios u ON u.id = um.usuario_id
            JOIN modulos m ON m.id = um.modulo_id`,
    ordem: 'um.usuario_id, m.ordem',
  },
  usuarios_permitidos: {
    titulo: 'Allowlist',
    sql: 'SELECT email, modulos, criado_em FROM usuarios_permitidos',
    ordem: 'email',
  },
  modulos: {
    titulo: 'Módulos do sistema',
    sql: 'SELECT id, codigo, nome, ordem, habilitado FROM modulos',
    ordem: 'ordem',
  },
  clientes: { titulo: 'Clientes', sql: 'SELECT * FROM clientes', ordem: 'id' },
  locais_embarque: { titulo: 'Locais de embarque', sql: 'SELECT * FROM locais_embarque', ordem: 'id' },
  padroes_embarque: { titulo: 'Padrões de embarque', sql: 'SELECT * FROM padroes_embarque', ordem: 'local_embarque_id' },
  cargas: { titulo: 'Cargas', sql: 'SELECT * FROM cargas', ordem: 'id' },
  carga_comercial: { titulo: 'Carga comercial', sql: 'SELECT * FROM carga_comercial', ordem: 'carga_id' },
}

const SQL_USUARIOS = `
  SELECT u.id, u.nome, u.email, u.papel, u.ativo,
         (u.google_sub IS NOT NULL) AS google_vinculado,
         (u.senha_hash IS NOT NULL) AS tem_senha,
         u.criado_em, u.atualizado_em,
         COALESCE((SELECT array_agg(m.codigo ORDER BY m.ordem)
                     FROM usuario_modulo um
                     JOIN modulos m ON m.id = um.modulo_id
                    WHERE um.usuario_id = u.id AND um.ativo), '{}') AS modulos,
         (SELECT MAX(a.criado_em) FROM auditoria a
           WHERE a.usuario_id = u.id AND a.evento = 'login_ok') AS ultimo_login
    FROM usuarios u`

function erro(res, status, mensagem) {
  return res.status(status).json({ erro: mensagem })
}

function idValido(valor) {
  return /^\d{1,18}$/.test(String(valor)) ? String(valor) : null
}

function texto(valor, max) {
  return typeof valor === 'string' ? valor.trim().slice(0, max) : ''
}

// Motivo é gravado na auditoria. Nas ações sensíveis ele é obrigatório.
function lerMotivo(corpo, obrigatorio) {
  const motivo = texto(corpo.motivo, 500)
  if (obrigatorio && motivo.length < 5) {
    return { erro: 'Informe o motivo da alteração (mínimo 5 caracteres).' }
  }
  return { motivo: motivo || null }
}

async function catalogoModulos(client = db) {
  const { rows } = await client.query('SELECT id, codigo, nome, ordem, habilitado FROM modulos ORDER BY ordem')
  return rows
}

// Converte a lista enviada pelo front em códigos de módulo válidos (sem repetição).
function lerCodigosModulos(lista, catalogo) {
  if (!Array.isArray(lista)) return { erro: 'Informe a lista de módulos.' }
  const codigos = [...new Set(lista.map((item) => String(item).trim().toUpperCase()))]
  const validos = new Set(catalogo.map((modulo) => modulo.codigo))
  const invalidos = codigos.filter((codigo) => !validos.has(codigo))
  if (invalidos.length) return { erro: `Módulo inexistente: ${invalidos.join(', ')}.` }
  if (!codigos.length) return { erro: 'Escolha ao menos um módulo. Para bloquear o acesso, desative o usuário.' }
  // Mantém a ordem dos módulos do sistema, para comparar antes/depois de forma estável.
  return { codigos: catalogo.filter((modulo) => codigos.includes(modulo.codigo)).map((modulo) => modulo.codigo) }
}

async function modulosDoUsuario(usuarioId, client = db) {
  const { rows } = await client.query(
    `SELECT m.codigo FROM usuario_modulo um JOIN modulos m ON m.id = um.modulo_id
      WHERE um.usuario_id = $1 AND um.ativo ORDER BY m.ordem`,
    [usuarioId],
  )
  return rows.map((row) => row.codigo)
}

async function detalheUsuario(id) {
  const { rows } = await db.query(`${SQL_USUARIOS} WHERE u.id = $1`, [id])
  return rows[0] ?? null
}

// Escapa % e _ para a busca por trecho não virar curinga.
function escaparLike(valor) {
  return valor.replace(/[\\%_]/g, (caractere) => `\\${caractere}`)
}

// ---------------------------------------------------------------------
// Visão geral
// ---------------------------------------------------------------------
router.get('/resumo', async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM usuarios)                                           AS usuarios_total,
      (SELECT COUNT(*) FROM usuarios WHERE ativo)                               AS usuarios_ativos,
      (SELECT COUNT(*) FROM usuarios WHERE ativo AND papel = 'admin')           AS administradores,
      (SELECT COUNT(*) FROM usuarios_permitidos)                                AS allowlist,
      (SELECT COUNT(*) FROM auditoria WHERE criado_em > now() - interval '24 hours') AS eventos_24h,
      (SELECT COUNT(*) FROM auditoria
        WHERE evento IN ('login_negado', 'bloqueio') AND criado_em > now() - interval '24 hours') AS alertas_24h`)
  const r = rows[0]
  res.json({
    usuariosTotal: Number(r.usuarios_total),
    usuariosAtivos: Number(r.usuarios_ativos),
    administradores: Number(r.administradores),
    allowlist: Number(r.allowlist),
    eventos24h: Number(r.eventos_24h),
    alertas24h: Number(r.alertas_24h),
  })
})

// ---------------------------------------------------------------------
// Usuários
// ---------------------------------------------------------------------
router.get('/usuarios', async (req, res) => {
  const busca = texto(req.query.busca, 120)
  const params = []
  let where = ''
  if (busca) {
    params.push(`%${escaparLike(busca.toLowerCase())}%`)
    where = 'WHERE lower(u.nome) LIKE $1 OR lower(u.email) LIKE $1'
  }
  const { rows } = await db.query(`${SQL_USUARIOS} ${where} ORDER BY u.nome, u.id`, params)
  res.json({ itens: rows })
})

router.get('/usuarios/:id', async (req, res) => {
  const id = idValido(req.params.id)
  if (!id) return erro(res, 400, 'Usuário inválido.')
  const usuario = await detalheUsuario(id)
  if (!usuario) return erro(res, 404, 'Usuário não encontrado.')
  res.json(usuario)
})

// Ativar/desativar e trocar papel. Desativar ou rebaixar exige motivo.
router.patch('/usuarios/:id', async (req, res) => {
  const id = idValido(req.params.id)
  if (!id) return erro(res, 400, 'Usuário inválido.')
  if (id === String(req.usuario.id)) return erro(res, 400, 'Você não pode alterar a própria conta por aqui.')

  const corpo = req.body ?? {}
  const { ativo, papel } = corpo
  if (ativo === undefined && papel === undefined) return erro(res, 400, 'Nada para alterar.')
  if (ativo !== undefined && typeof ativo !== 'boolean') return erro(res, 400, 'Campo "ativo" inválido.')
  if (papel !== undefined && !PAPEIS.includes(papel)) return erro(res, 400, 'Papel inválido.')

  const resultado = await db.transacao(async (client) => {
    const { rows } = await client.query('SELECT id, ativo, papel FROM usuarios WHERE id = $1 FOR UPDATE', [id])
    const alvo = rows[0]
    if (!alvo) return { status: 404, erro: 'Usuário não encontrado.' }

    const antes = { ativo: alvo.ativo, papel: alvo.papel }
    const depois = { ativo: ativo ?? alvo.ativo, papel: papel ?? alvo.papel }
    if (depois.ativo === antes.ativo && depois.papel === antes.papel) {
      return { status: 400, erro: 'Nenhuma alteração para salvar.' }
    }

    const sensivel = (antes.ativo && !depois.ativo) || antes.papel !== depois.papel
    const motivo = lerMotivo(corpo, sensivel)
    if (motivo.erro) return { status: 400, erro: motivo.erro }

    await client.query(
      'UPDATE usuarios SET ativo = $2, papel = $3, atualizado_em = now() WHERE id = $1',
      [id, depois.ativo, depois.papel],
    )
    // Desativar ou trocar o papel derruba as sessões abertas: o usuário entra de novo
    // com o acesso novo (ou não entra mais).
    if (sensivel) await revogarSessoes(id, client)
    await registrarAcaoAdmin(client, {
      admin: req.usuario,
      evento: 'usuario_alterado',
      entidade: 'usuario',
      entidadeId: id,
      ip: req.ip,
      antes,
      depois,
      motivo: motivo.motivo,
    })
    return { status: 200 }
  })

  if (resultado.status !== 200) return erro(res, resultado.status, resultado.erro)
  res.json(await detalheUsuario(id))
})

// Troca os módulos liberados ao usuário (usuario_modulo). Efeito imediato: verificarAcesso
// revalida os módulos a cada requisição.
router.put('/usuarios/:id/modulos', async (req, res) => {
  const id = idValido(req.params.id)
  if (!id) return erro(res, 400, 'Usuário inválido.')
  if (id === String(req.usuario.id)) return erro(res, 400, 'Você não pode alterar a própria conta por aqui.')

  const corpo = req.body ?? {}
  const catalogo = await catalogoModulos()
  const lidos = lerCodigosModulos(corpo.modulos, catalogo)
  if (lidos.erro) return erro(res, 400, lidos.erro)

  const resultado = await db.transacao(async (client) => {
    const { rows } = await client.query('SELECT id FROM usuarios WHERE id = $1 FOR UPDATE', [id])
    if (!rows[0]) return { status: 404, erro: 'Usuário não encontrado.' }

    const antes = await modulosDoUsuario(id, client)
    if (JSON.stringify(antes) === JSON.stringify(lidos.codigos)) {
      return { status: 400, erro: 'Nenhuma alteração para salvar.' }
    }

    await client.query(
      `INSERT INTO usuario_modulo (usuario_id, modulo_id, ativo)
       SELECT $1, m.id, m.codigo = ANY ($2::varchar[]) FROM modulos m
       ON CONFLICT (usuario_id, modulo_id) DO UPDATE SET ativo = EXCLUDED.ativo`,
      [id, lidos.codigos],
    )
    await registrarAcaoAdmin(client, {
      admin: req.usuario,
      evento: 'modulos_alterados',
      entidade: 'usuario',
      entidadeId: id,
      ip: req.ip,
      antes,
      depois: lidos.codigos,
      motivo: lerMotivo(corpo, false).motivo,
    })
    return { status: 200 }
  })

  if (resultado.status !== 200) return erro(res, resultado.status, resultado.erro)
  res.json(await detalheUsuario(id))
})

// ---------------------------------------------------------------------
// Allowlist: e-mails que podem criar conta ou entrar
// ---------------------------------------------------------------------
router.get('/allowlist', async (req, res) => {
  const { rows } = await db.query(`
    SELECT p.email, p.modulos, p.criado_em,
           (p.convite_hash IS NOT NULL AND p.convite_expira_em > now()) AS convite_pendente,
           p.convite_expira_em,
           u.id AS usuario_id, u.nome AS usuario_nome, u.ativo AS usuario_ativo
      FROM usuarios_permitidos p
      LEFT JOIN usuarios u ON u.email = p.email
     ORDER BY p.email`)
  res.json({ itens: rows })
})

router.get('/modulos', async (req, res) => {
  res.json({ itens: await catalogoModulos() })
})

router.post('/allowlist', async (req, res) => {
  const corpo = req.body ?? {}
  const email = texto(corpo.email, 255).toLowerCase()
  if (!EMAIL_REGEX.test(email)) return erro(res, 400, 'Informe um e-mail válido.')

  const catalogo = await catalogoModulos()
  const lidos = lerCodigosModulos(corpo.modulos, catalogo)
  if (lidos.erro) return erro(res, 400, lidos.erro)

  const resultado = await db.transacao(async (client) => {
    const existe = await client.query('SELECT 1 FROM usuarios_permitidos WHERE email = $1', [email])
    if (existe.rows.length) return { status: 409, erro: 'Este e-mail já está na allowlist.' }

    await client.query('INSERT INTO usuarios_permitidos (email, modulos) VALUES ($1, $2)', [email, lidos.codigos])
    const conta = await client.query('SELECT id FROM usuarios WHERE email = $1', [email])
    // Convite para o cadastro com senha (só faz sentido se ainda não há conta).
    const novoConvite = conta.rows.length ? null : await convite.criarConvite(client, email)
    await registrarAcaoAdmin(client, {
      admin: req.usuario,
      evento: 'allowlist_adicionado',
      entidade: 'allowlist',
      entidadeId: email,
      ip: req.ip,
      depois: { email, modulos: lidos.codigos, convite_gerado: Boolean(novoConvite) },
    })
    return { status: 201, usuarioExiste: conta.rows.length > 0, convite: novoConvite }
  })

  if (resultado.status !== 201) return erro(res, resultado.status, resultado.erro)
  // Se a conta já existe, os módulos dela não mudam aqui (ajuste na aba Usuários).
  // O código do convite só aparece nesta resposta: no banco fica apenas o hash.
  res.status(201).json({ email, usuarioExiste: resultado.usuarioExiste, convite: resultado.convite })
})

// Gera um novo código de convite (o anterior deixa de valer). Usado quando o código
// expirou ou se perdeu.
router.post('/allowlist/:email/convite', async (req, res) => {
  const email = texto(req.params.email, 255).toLowerCase()

  const resultado = await db.transacao(async (client) => {
    const { rows } = await client.query('SELECT 1 FROM usuarios_permitidos WHERE email = $1 FOR UPDATE', [email])
    if (!rows[0]) return { status: 404, erro: 'E-mail não encontrado na allowlist.' }
    const conta = await client.query('SELECT 1 FROM usuarios WHERE email = $1', [email])
    if (conta.rows.length) return { status: 409, erro: 'Este e-mail já tem conta; não precisa de convite.' }

    const novoConvite = await convite.criarConvite(client, email)
    await registrarAcaoAdmin(client, {
      admin: req.usuario,
      evento: 'convite_gerado',
      entidade: 'allowlist',
      entidadeId: email,
      ip: req.ip,
      depois: { expira_em: novoConvite.expiraEm },
    })
    return { status: 201, convite: novoConvite }
  })

  if (resultado.status !== 201) return erro(res, resultado.status, resultado.erro)
  res.status(201).json({ email, convite: resultado.convite })
})

router.put('/allowlist/:email', async (req, res) => {
  const email = texto(req.params.email, 255).toLowerCase()
  if (email === req.usuario.email) return erro(res, 400, 'Você não pode alterar a própria permissão por aqui.')

  const catalogo = await catalogoModulos()
  const lidos = lerCodigosModulos((req.body ?? {}).modulos, catalogo)
  if (lidos.erro) return erro(res, 400, lidos.erro)

  const resultado = await db.transacao(async (client) => {
    const { rows } = await client.query('SELECT modulos FROM usuarios_permitidos WHERE email = $1 FOR UPDATE', [email])
    if (!rows[0]) return { status: 404, erro: 'E-mail não encontrado na allowlist.' }

    const antes = rows[0].modulos
    if (JSON.stringify(antes) === JSON.stringify(lidos.codigos)) {
      return { status: 400, erro: 'Nenhuma alteração para salvar.' }
    }
    await client.query('UPDATE usuarios_permitidos SET modulos = $2 WHERE email = $1', [email, lidos.codigos])
    await registrarAcaoAdmin(client, {
      admin: req.usuario,
      evento: 'allowlist_alterado',
      entidade: 'allowlist',
      entidadeId: email,
      ip: req.ip,
      antes: { modulos: antes },
      depois: { modulos: lidos.codigos },
    })
    return { status: 200 }
  })

  if (resultado.status !== 200) return erro(res, resultado.status, resultado.erro)
  res.json({ email, modulos: lidos.codigos })
})

// Remover da allowlist corta o acesso na hora: verificarAcesso confere a lista a cada requisição.
router.delete('/allowlist/:email', async (req, res) => {
  const email = texto(req.params.email, 255).toLowerCase()
  if (email === req.usuario.email) return erro(res, 400, 'Você não pode remover o próprio e-mail da allowlist.')

  const motivo = lerMotivo(req.body ?? {}, true)
  if (motivo.erro) return erro(res, 400, motivo.erro)

  const resultado = await db.transacao(async (client) => {
    const { rows } = await client.query('SELECT email, modulos FROM usuarios_permitidos WHERE email = $1 FOR UPDATE', [email])
    if (!rows[0]) return { status: 404, erro: 'E-mail não encontrado na allowlist.' }

    await client.query('DELETE FROM usuarios_permitidos WHERE email = $1', [email])
    await registrarAcaoAdmin(client, {
      admin: req.usuario,
      evento: 'allowlist_removido',
      entidade: 'allowlist',
      entidadeId: email,
      ip: req.ip,
      antes: { email, modulos: rows[0].modulos },
      motivo: motivo.motivo,
    })
    return { status: 200 }
  })

  if (resultado.status !== 200) return erro(res, resultado.status, resultado.erro)
  res.status(204).end()
})

// ---------------------------------------------------------------------
// Auditoria (somente leitura)
// ---------------------------------------------------------------------
function inteiro(valor, padrao, min, max) {
  const numero = Number.parseInt(valor, 10)
  if (Number.isNaN(numero)) return padrao
  return Math.min(Math.max(numero, min), max)
}

function data(valor) {
  const valorTexto = texto(valor, 40)
  if (!valorTexto) return null
  const instante = new Date(valorTexto)
  return Number.isNaN(instante.getTime()) ? null : instante.toISOString()
}

router.get('/auditoria', async (req, res) => {
  const q = req.query
  const filtros = []
  const params = []
  const adicionar = (condicao, valor) => {
    params.push(valor)
    filtros.push(condicao.replace('?', `$${params.length}`))
  }

  const evento = texto(q.evento, 40)
  if (evento) adicionar('a.evento = ?', evento)

  const email = texto(q.email, 255).toLowerCase()
  if (email) adicionar("lower(a.email) LIKE ?", `%${escaparLike(email)}%`)

  const entidade = texto(q.entidade, 40)
  if (entidade) adicionar('a.entidade = ?', entidade)

  const entidadeId = texto(q.entidade_id, 80)
  if (entidadeId) adicionar('a.entidade_id = ?', entidadeId)

  const usuarioId = idValido(q.usuario_id)
  if (usuarioId) adicionar('a.usuario_id = ?', usuarioId)

  const de = data(q.de)
  if (de) adicionar('a.criado_em >= ?', de)
  const ate = data(q.ate)
  if (ate) adicionar('a.criado_em <= ?', ate)

  const limite = inteiro(q.limite, 50, 1, 200)
  const pagina = inteiro(q.pagina, 1, 1, 100000)
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : ''

  const [itens, contagem] = await Promise.all([
    db.query(
      `SELECT a.id, a.evento, a.usuario_id, u.nome AS usuario_nome, a.email, a.ip,
              a.entidade, a.entidade_id, a.detalhes, a.criado_em
         FROM auditoria a
         LEFT JOIN usuarios u ON u.id = a.usuario_id
         ${where}
        ORDER BY a.criado_em DESC, a.id DESC
        LIMIT ${limite} OFFSET ${(pagina - 1) * limite}`,
      params,
    ),
    db.query(`SELECT COUNT(*) AS total FROM auditoria a ${where}`, params),
  ])

  res.json({
    itens: itens.rows,
    total: Number(contagem.rows[0].total),
    pagina,
    limite,
  })
})

// Eventos já registrados, para preencher o filtro da tela.
router.get('/auditoria/eventos', async (req, res) => {
  const { rows } = await db.query('SELECT DISTINCT evento FROM auditoria ORDER BY evento')
  res.json({ itens: rows.map((row) => row.evento) })
})

// ---------------------------------------------------------------------
// Dados: leitura de qualquer tabela da lista TABELAS
// ---------------------------------------------------------------------
router.get('/tabelas', (req, res) => {
  res.json({
    itens: Object.entries(TABELAS).map(([nome, config]) => ({ nome, titulo: config.titulo })),
  })
})

router.get('/tabelas/:nome', async (req, res) => {
  const config = TABELAS[req.params.nome]
  if (!config) return erro(res, 404, 'Tabela não disponível.')

  const limite = inteiro(req.query.limite, 100, 1, 500)
  const pagina = inteiro(req.query.pagina, 1, 1, 100000)
  const offset = (pagina - 1) * limite

  const [dados, contagem] = await Promise.all([
    db.query(`${config.sql} ORDER BY ${config.ordem} LIMIT $1 OFFSET $2`, [limite, offset]),
    db.query(`SELECT COUNT(*) AS total FROM (${config.sql}) t`),
  ])

  res.json({
    titulo: config.titulo,
    colunas: dados.fields.map((campo) => campo.name),
    linhas: dados.rows,
    total: Number(contagem.rows[0].total),
    pagina,
    limite,
  })
})

module.exports = router
