require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 3000

// Atrás do Nginx (rede do Docker), para req.ip ser o IP real do cliente (RF18).
app.set('trust proxy', 'loopback, uniquelocal')
app.disable('x-powered-by')

if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN.split(',').map((o) => o.trim()), credentials: true }))
}
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/api', authRoutes)

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' })
})

// Erro inesperado: detalhes só no log do servidor (RN09).
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') return res.status(400).json({ erro: 'Requisição inválida.' })
  console.error(error)
  res.status(500).json({ erro: 'Erro interno. Tente novamente.' })
})

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`)
})
