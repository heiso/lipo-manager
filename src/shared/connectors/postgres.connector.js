const EventEmitter = require('events')
const { Pool } = require('pg')

class PostgresConnector extends EventEmitter {
  constructor (config) {
    super()
    PostgresConnector.instances.push(this)
    this.config = config
    this.pool = null
  }

  async isConnected () {
    try {
      await this.pool.query('SELECT 1')
      return true
    } catch (err) {
      return false
    }
  }

  async connect () {
    try {
      this.pool = await new Pool(this.config)
      console.info(`Postgres pool initialized`)
      this.pool.once('error', async (err) => {
        this.emit('disconnected')
        this.error(`${err.message}`, err)
        await this.pool.end()
        this.connect()
      })
      this.emit('connected')
    } catch (err) {
      console.error(`${err.message}`, err)
    }
  }
}

PostgresConnector.instances = []

module.exports = {
  PostgresConnector,
  get postgresConnector () {
    return PostgresConnector.instances[0]
  }
}
