const _ = require('lodash')

function mergeSchemas (schemas = []) {
  return {
    typeDefs: schemas.map((schema) => schema.typeDefs),
    resolvers: schemas.map((schema) => schema.resolvers),
    schemaDirectives: schemas.reduce((acc, schema) => {
      acc = {
        ...acc,
        ...schema.schemaDirectives
      }
      return acc
    }, {})
  }
}

function schemaMutator (schema, fieldMutators) {
  if (!(fieldMutators instanceof Array)) {
    fieldMutators = [fieldMutators]
  }
  _.each(schema.getTypeMap(), (type) => {
    if (!type.name.startsWith('__') && type.getFields) {
      _.each(type.getFields(), (field) => {
        _.eachRight(fieldMutators, (fieldMutator) => {
          fieldMutator(field, type)
        })
      })
    }
  })
  return schema
}

module.exports = {
  mergeSchemas,
  schemaMutator
}
