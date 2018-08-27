const _ = require('lodash')
const squel = require('squel').useFlavour('postgres')
const uuidv4 = require('uuid/v4')
const { postgresqlConnector } = require('../connectors/postgres.connector')

const DEFAULT_WHERE = `deleted = false`
const DEFAULT_LIMIT = 100

class PostgresqlModel {
  constructor (table) {
    this.table = table
  }

  get pool () {
    return postgresqlConnector.pool
  }

  async get (id, context) {
    const query = squel
      .select()
      .from(this.table)
      .where(DEFAULT_WHERE)
      .where('id = ?', id)
      .toParam()
    const {rows} = await this.pool.query(query)
    return this._parseRow(_.first(rows))
  }

  async list (options, context) {
    const {cursor, limit, orderBy, isSortAsc} = this._format(options)
    const query = squel
      .select()
      .from(this.table)
      .where(DEFAULT_WHERE)
      .limit(limit)
      .order(orderBy, isSortAsc)
    if (cursor) query.where(cursor.where, cursor.subQuery)
    const {rows} = await this.pool.query(query.toParam())
    return this._parseRows(rows)
  }

  async belongsTo (foreignKey, belongsToId, options, context) {
    const {cursor, limit, orderBy, isSortAsc} = this._format(options)
    const query = squel
      .select()
      .from(this.table)
      .where(DEFAULT_WHERE)
      .where(`${foreignKey} = ?`, belongsToId)
      .limit(limit)
      .order(orderBy, isSortAsc)
    if (cursor) query.where(cursor.where, cursor.subQuery)
    const {rows} = await this.pool.query(query.toParam())
    return this._parseRows(rows)
  }

  async create (input, context) {
    const fields = {
      ...input,
      id: uuidv4()
    }
    const query = squel
      .insert()
      .into(this.table)
      .setFields(fields)
      .toParam()
    await this.pool.query(query)
    return this.get(fields.id, context)
  }

  async update (id, input, context) {
    const query = squel
      .update()
      .table(this.table)
      .setFields(input)
      .where('id = ?', id)
      .toParam()
    await this.pool.query(query)
    return this.get(id, context)
  }

  async delete (id, context) {
    const query = squel
      .update()
      .table(this.table)
      .set('deleted', true)
      .where('id = ?', id)
      .toParam()
    await this.pool.query(query)
    return this.get(id, context)
  }

  _format (options = {}) {
    let cursor = false
    const limit = options.first || options.last || DEFAULT_LIMIT
    const orderBy = 'created_at'
    const isSortAsc = !!options.first
    if (options.after) {
      cursor = {
        where: 'created_at > ?',
        subQuery: squel.select().field('created_at').from(this.table).where('id = ?', options.after)
      }
    } else if (options.before) {
      cursor = {
        where: 'created_at < ?',
        subQuery: squel.select().field('created_at').from(this.table).where('id = ?', options.before)
      }
    }

    return {
      limit,
      orderBy,
      isSortAsc,
      cursor
    }
  }

  _parseRow (row = {}) {
    if (!_.size(row)) return null
    return {
      ..._.omit(row, ['created_at', 'updated_at']),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  _parseRows (rows = []) {
    return rows.map(this._parseRow)
  }
}

module.exports = {
  PostgresqlModel
}
