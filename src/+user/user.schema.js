const { gql } = require('apollo-server')
const { userModel } = require('./user.model')

const typeDefs = gql`
  type User @extends(type: "Resource") {
    firstname: String
    lastname: String
    email: Email
    sessions: [Session]
  }

  type Session {
    userAgent: String
    loggedAt: String
  }

  input UpdateMeInput {
    firstname: String
    lastname: String
  }
  
  extend type Query {
    getMe: User
  }

  extend type Mutation {
    updateMe(input: UpdateMeInput!): User
    login(email: Email!, password: Password!): User @isPublic
    logout: User
  }
`

const resolvers = {
  Query: {
    async getMe (parent, args, context) {
      return userModel.getMe(context)
    }
  },
  User: {
    async sessions (parent, args, context) {
      return userModel.getSessions(context)
    }
  },
  Mutation: {
    async updateMe (parent, {input}, context) {
      return userModel.updateMe(input, context)
    },
    async login (parent, {email, password}, context) {
      return userModel.login(email, password, context)
    },
    async logout (parent, args, context) {
      return userModel.logout(context)
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
