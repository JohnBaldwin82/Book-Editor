const { User } = require('../models')
const { signToken } = require('../utils/auth')
const { AuthenticationError } = require('apollo-server-express')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id})
            }

            throw new AuthenticationError('You are not logged in yet')
        }
    },
    Mutation: {
        login: async (parent, { email, password}) => {
            const myUser = await User.findOne({email})

            if(!myUser) {
                throw new AuthenticationError('Error')
            }

            const myToken = signToken(user)

            return { myToken, user}
        }
    }
}