const config = require('config')
const { ApolloServer } = require('apollo-server-express')
const { mergeSchemas, schemaMutator } = require('./shared/schema.util')
const authenticationService = require('./shared/authentication.service')
const { graphqlErrorHandler } = require('./shared/error.service')

const TRACING = config.get('graphql.tracing')
const ENGINE = config.get('graphql.engine')

const schemas = [
  require('./+root/root.schema')
]

const directives = [
  require('./shared/directives/extends.directive')
]

const graphqlServer = new ApolloServer({
  ...mergeSchemas([...schemas, ...directives]),
  context: ({req, res}) => ({
    req,
    res
  }),
  tracing: TRACING,
  engine: ENGINE,
  formatError: graphqlErrorHandler
})

schemaMutator(graphqlServer.schema, [authenticationService.fieldMutator])

module.exports = { graphqlServer }
