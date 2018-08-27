const config = require('config')
const _ = require('lodash')
const uuid = require('uuid/v4')
const redisConnector = require('../shared/connectors/redis.connector')

const SESSION_COOKIE_NAME = config.get('authentication.sessionCookieName')
const SESSION_EXPIRATION_TIME = config.get('authentication.sessionExpirationTime')
const WHITELIST_PREFIX = config.get('authentication.whitelistPrefix')
const COOKIE_CONFIG = {
  maxAge: SESSION_EXPIRATION_TIME,
  httpOnly: true,
  secure: config.get('authentication.sessionCookieHttpsOnly'),
  domain: config.get('authentication.sessionCookieDomain')
}

async function getSession (token, context) {
  const [key] = await redisConnector.client.keys(_getRedisKey('*', token))
  if (!key) {
    context.res.clearCookie(SESSION_COOKIE_NAME)
    return null
  }
  const session = await redisConnector.client.get(key).then(_parseSession)
  if (session.userAgent !== context.req.header('user-agent')) {
    context.res.clearCookie(SESSION_COOKIE_NAME)
    return null
  }
  return session
}

async function createSession (user, context) {
  const token = uuid()
  const session = {
    userId: user.id,
    userAgent: context.req.header('user-agent'),
    loggedAt: Date.now()
  }
  const value = _serializeSession(session)
  await redisConnector.client.set(_getRedisKey(user.id, token), value, 'PX', SESSION_EXPIRATION_TIME, 'NX')
  context.res.cookie(SESSION_COOKIE_NAME, token, COOKIE_CONFIG)
  return session
}

async function keepAliveSession (context) {
  const {id, token} = context.req.user
  await redisConnector.client.expire(_getRedisKey(id, token), SESSION_EXPIRATION_TIME)
  context.res.cookie(SESSION_COOKIE_NAME, token, COOKIE_CONFIG)
}

async function destroySession (context) {
  const {id, token} = context.req.user
  await redisConnector.client.del(_getRedisKey(id, token))
  context.res.clearCookie(SESSION_COOKIE_NAME, COOKIE_CONFIG)
}

async function getUserSessions (userId) {
  const keys = await _getUserSessionsKeys(userId)
  const values = await redisConnector.client.mget(...keys)
  return _.map(values, _parseSession)
}

async function destroyUserSessions (userId, context) {
  const keys = await _getUserSessionsKeys(userId)
  await redisConnector.client.del(...keys)
  if (context.req.user.id === userId) {
    context.res.clearCookie(SESSION_COOKIE_NAME, COOKIE_CONFIG)
  }
}

// use SCAN instead of KEYS for optimisation purpose, perform multiple light operation is better than a big single operation
async function _getUserSessionsKeys (userId, oldKeys = [], cursor = '0') {
  const [newCursor, keys] = await redisConnector.client.scan(cursor, 'MATCH', _getRedisKey(userId))
  const newKeys = [...oldKeys, ...keys]
  if (newCursor !== '0') return _getUserSessionsKeys(userId, newKeys, newCursor)
  return newKeys
}

function _getRedisKey (userId = '*', token = '*') {
  return `${WHITELIST_PREFIX}/${userId}/${token}`
}

function _serializeSession (session) {
  return JSON.stringify(session)
}

function _parseSession (value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch (err) {
    return null
  }
}

module.exports = {
  getSession,
  getUserSessions,
  createSession,
  keepAliveSession,
  destroySession,
  destroyUserSessions
}
