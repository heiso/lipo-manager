const config = require('config')
const express = require('express')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const { graphqlServer } = require('./graphql')
const { expressErrorHandler } = require('./shared/error.service')

const CORS = config.get('express.cors')
const PORT = config.get('express.port')

const app = express()

app.use(helmet())
app.use(helmet.noCache())
app.use(cookieParser())
app.use(expressErrorHandler)

graphqlServer.applyMiddleware({app, cors: CORS})

app.listen(config.get('express.port'), (err) => {
  if (err) return console.error(err)
  console.log(`Express running on port ${PORT}`)
})

module.exports = {
  app
}
