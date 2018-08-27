const config = require('config')
const _ = require('lodash')
const { getSession, keepAliveSession } = require('./session.service')
const { CustomError } = require('./error.service')
const { userModel } = require('../+user/user.model')

const SESSION_COOKIE_NAME = config.get('authentication.sessionCookieName')

async function expressMiddleware (req, res, next) {
  const token = req.cookies[SESSION_COOKIE_NAME]

  if (!token) return next()

  // get session
  const session = await getSession(token, {req, res})
  if (!session) return next()

  // if session found get user
  const [user, roles] = await Promise.all([
    userModel.get(session.userId),
    userModel.getRoles(session.userId)
  ])

  // if session found populate context
  if (user) {
    req.user = {...user, roles}
  }

  // if session found renew cookie validity
  if (req.method === 'OPTIONS') {
    keepAliveSession({req, res})
  }

  return next()
}

function fieldMutator (field, parentType) {
  const {resolve, astNode} = field
  const hasIsPublicDirective = !!_.find(astNode.directives, (directive) => directive.name.value === 'isPublic')
  if (resolve && !hasIsPublicDirective) {
    field.resolve = async (parent, args, context, astNode) => {
      if (!context.req.user) throw new CustomError(401, 'Not Authenticated', context)
      return resolve.apply(resolve, [parent, args, context, astNode])
    }
  }
}

module.exports = {
  expressMiddleware,
  fieldMutator
}
