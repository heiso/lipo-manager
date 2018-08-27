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
    passwordSalt: 'ksbhjdgSH4azGDF'
  },
  connectors: {
    redis: {
      host: '127.0.0.1',
      port: 6379
    },
    postgres: {
      host: '127.0.0.1',
      port: 5432,
      database: 'lipo-manager',
      user: 'lipo-manager',
      password: 'password'
    }
  }
}
