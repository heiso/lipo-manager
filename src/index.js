const express = require('express')

const app = express()

app.get('/health', (req, res) => {
  res.send('healthy')
})

app.listen(3000, () => {
  console.log('To the moon')
})
