require('dotenv').config()
const express = require('express')

const app = express()
const PORT = process.env.PORT || 3000

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`)
})
