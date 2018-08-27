const { gql } = require('apollo-server')
const GraphQLJSON = require('graphql-type-json')
const { version } = require('../../package.json')
const { postgresConnector } = require('../shared/connectors/postgres.connector')
const { redisConnector } = require('../shared/connectors/redis.connector')

const typeDefs = gql`
  type Resource {
    id: ID!
    deleted: Boolean!
    createdAt: String!
    updatedAt: String!
    createdBy: String
    updatedBy: String
  }

  type Query {
    health: JSON @isPublic
    version: String @isPublic
  }

  type Mutation {
    noop(bool: Boolean): Boolean
  }

  scalar JSON

  schema {
    query: Query
    mutation: Mutation
  }
`

const resolvers = {
  Query: {
    async health () {
      return {
        app: true,
        resourceDB: await postgresConnector.isConnected(),
        sessionDB: redisConnector.isConnected
      }
    },
    version: () => version
  },
  Mutation: {
    noop: (parent, args, context) => args.bool
  },
  JSON: GraphQLJSON
}

module.exports = {
  typeDefs,
  resolvers
}
