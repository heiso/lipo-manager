const config = require('config')
const { RedisConnector } = require('./shared/connectors/redis.connector')
const { PostgresConnector } = require('./shared/connectors/postgres.connector')

const redisConnector = new RedisConnector(config.get('connectors.redis'))
const postgresConnector = new PostgresConnector(config.get('connectors.postgres'))

redisConnector.connect()
postgresConnector.connect()
require('./express')
