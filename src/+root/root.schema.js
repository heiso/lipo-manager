const { gql } = require('apollo-server')
const GraphQLJSON = require('graphql-type-json')
const { version } = require('../../package.json')

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
