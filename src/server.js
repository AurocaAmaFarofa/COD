require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: process.env.CORS_ORIGIN }))

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`)
})
