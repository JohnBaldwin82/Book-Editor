const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User } = require('../models');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                return userData;
            }
            throw new AuthenticationError('Error: Not Logged in!');
        },
        users: async () => {
            return User.find().select("-__v -password").populate("book");
        },
        user: async (parent, { username }) => {
            return User.findOne({ username })
                .select("-__v -password")
                .populate("book");
        },
    },
    Mutation: {
        addUser: async (parents, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parents, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError("Incorrect Username or Password");
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError("Incorrect Username or Password");
            }
            const token = await signToken(user);
            console.log(user, token)
            return { token, user };
        },
        saveBook: async (parent, { bookToSave }, context) => {
            console.log('message', bookToSave);
            console.log(context.user, "User");
            if (context.user) {
                const savedBook = User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookToSave } },
                    { new: true }
                );
                return savedBook;
            }
            throw new AuthenticationError('Must sign up or Log in!');
        },
        removeBook: async (parent, { bookId }, context) => {
            try{
            if (context.user) {
                const revisedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: {savedBooks: { bookId: bookId}}},
                    { new: true }
                );
                return revisedUser;
            }
        }
        catch (error){
            console.error('Error fetching user Data', error);
        }
    }
    
    }
};

module.exports = resolvers;