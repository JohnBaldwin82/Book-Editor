const { User } = require("../models");
const { signToken } = require("../utils/auth");
const { AuthenticationError } = require("apollo-server-express");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }

      throw new AuthenticationError("You are not logged in yet");
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Error");
      }

      const myToken = signToken(user);

      return { myToken, user };
    },
    saveBook: async (parent, { book }, context) => {
      if (context.user) {
        try {
          const revisedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: book } },
            { new: true, runValidators: true }
          );

          return revisedUser;
        } catch (err) {
          throw new Error("problem with book saving");
        }
      }
      throw new AuthenticationError("You have to be logged in for that");
    },
    removeBook: async (parent, { bookId }, context) => {
      const revisedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      if (!revisedUser) {
        throw new Error("This ID does not return a valid user");
      }
      return revisedUser;
    },
  },
};

module.exports = resolvers;
