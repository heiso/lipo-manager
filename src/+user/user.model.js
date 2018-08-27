const config = require('config')
const _ = require('lodash')
const squel = require('squel').useFlavour('postgres')
const { pbkdf2Sync } = require('crypto')
const { PostgresqlModel } = require('../shared/models/postgresql.model')
const { getUserSessions, createSession, destroyUserSessions } = require('../shared/session.service')
const { CustomError } = require('../shared/error.service')

const PASSWORD_SALT = config.get('authentication')
const PASSWORD_ITERATIONS = 100000
const PASSWORD_BYTE_LENGTH = 128
const PASSWORD_ALG = 'SHA256'

class UserModel extends PostgresqlModel {
  constructor () {
    super('users')
  }

  async getMe (context) {
    return context.req.user
  }

  async login (email, password, context) {
    try {
      const query = squel
        .select()
        .from(this.table)
        .where('deleted = FALSE')
        .where('email = ?', email)
        .where('password = ?', this._getHashedPassword(email, password))
        .toParam()
      const {rows} = await this.pool.query(query)
      const user = this._parseRow(_.first(rows))

      if (!user) throw Error('User not found')

      await createSession(user, context)

      return user
    } catch (err) {
      console.error(err)
      throw new CustomError(100, 'Failed to Authenticate', context)
    }
  }

  async logout (context) {
    await destroyUserSessions(context.req.user.id, context)
    return context.req.user
  }

  getSessions (context) {
    return getUserSessions(context.req.user.id)
  }

  async updateMe (input, context) {
    return this.update(context.req.user.id, input, context)
  }

  async delete (id, context) {
    await destroyUserSessions(id, context)
    return PostgresqlModel.prototype.delete.apply(this, [id, context])
  }

  _getHashedPassword (email, password) {
    const salt = `${email}_${PASSWORD_SALT}`
    return pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_BYTE_LENGTH, PASSWORD_ALG).toString('hex')
  }
}

module.exports = {
  UserModel,
  userModel: new UserModel()
}
