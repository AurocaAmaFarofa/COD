require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/admin')

const app = express()
const PORT = process.env.PORT || 3000

// Atrás do Nginx, req.ip precisa ser o IP real do cliente (RF18). TRUST_PROXY=1 confia
// só no salto imediato (o Nginx), que sobrescreve o X-Forwarded-For com o IP que ele viu.
// Sem a variável (rodando direto, sem proxy), nenhum cabeçalho X-Forwarded-For é aceito:
// assim ninguém troca de "IP" a cada tentativa para escapar do bloqueio.
const trustProxy = process.env.TRUST_PROXY
app.set('trust proxy', trustProxy && /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy || false)
app.disable('x-powered-by')

// Cabeçalhos de segurança das respostas da API (o Nginx cuida dos da página).
// A API só devolve JSON: nada nela pode ser embutido em iframe, executado ou guardado em cache.
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cache-Control': 'no-store',
  })
  next()
})

if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN.split(',').map((o) => o.trim()), credentials: true }))
}
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api', authRoutes)
app.use('/api/admin', adminRoutes)

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' })
})

// Erro inesperado: detalhes só no log do servidor (RN09).
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') return res.status(400).json({ erro: 'Requisição inválida.' })
  if (error.type === 'entity.too.large') return res.status(413).json({ erro: 'Requisição grande demais.' })
  console.error(error)
  res.status(500).json({ erro: 'Erro interno. Tente novamente.' })
})

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`)
})
