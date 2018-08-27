const EventEmitter = require('events')
const RedisClient = require('ioredis')

class RedisConnector extends EventEmitter {
  constructor (config) {
    super()
    RedisConnector.instances.push(this)
    this.config = config
    this.attempts = 1
    this.client = null
    this.isConnected = false
  }

  async connect () {
    try {
      await new Promise((resolve, reject) => {
        this.client = new RedisClient({
          port: this.config.port,
          host: this.config.host
        })
          .on('connect', resolve)
          .on('end', reject)
          .on('error', reject)
      })
      console.log(`Redis connected after ${this.attempts} attempt(s)`)
      this.isConnected = true
      this.attempts = 1
      this.client.once('close', () => {
        this.emit('disconnected')
        this.connect()
      })
      this.emit('connected')
    } catch (err) {
      console.error(`${err.message} - attempts: ${this.attempts}`, err)
      this.isConnected = false
      this.attempts++
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return this.connect()
    }
  }
}

RedisConnector.instances = []

module.exports = {
  RedisConnector,
  get redisConnector () {
    return RedisConnector.instances[0]
  }
}
