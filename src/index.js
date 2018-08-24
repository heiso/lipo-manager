const express = require('express')
const { version } = require('../package.json')

const app = express()

app.get('/health', (req, res) => {
  res.send(`${version} is healthy`)
})

app.listen(3000, () => {
  console.log('To the moon')
})
