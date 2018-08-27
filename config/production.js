module.exports = {
  express: {
    cors: '*',
    port: 3000
  },
  graphql: {
    tracing: true,
    engine: false
  },
  authentication: {
    sessionCookieName: 'session',
    sessionCookieHttpsOnly: false,
    sessionCookieDomain: 'localhost',
    sessionExpirationTime: 1000 * 60 * 30,
    whitelistPrefix: 'whitelist',
    passwordSalt: process.env.PASSWORD_SALT
  },
  connectors: {
    redis: {
      host: 'redis',
      port: 6379
    },
    postgres: {
      host: 'postgres',
      port: 5432,
      database: 'postgres',
      user: 'postgres'
    }
  }
}
