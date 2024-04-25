const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    // Resolver for fetching the current user
    me: async (parent, args, context) => {
      console.log(context.user);
      // Check if user exists in context
      if (context.user) {
        // Fetch user details from the database using the user ID from context
        return User.findOne({ _id: context.user._id });
      }
      // Throw an error if user is not found in context
      throw new Error("User not found");
    },
  },
  Mutation: {
    // Resolver for user login
    login: async (parent, { email, password }) => {
      // Find user by email
      const user = await User.findOne({ email });
      // Throw error if user not found
      if (!user) {
        throw new Error("User not found");
      }

      // Check if the password is correct
      const isCorrectPassword = await user.isCorrectPassword(password);
      console.log(!isCorrectPassword);
      // Throw error if password is incorrect
      if (!isCorrectPassword) {
        throw new Error("Incorrect Credentials");
      }

      // Sign a token for the user
      const token = signToken(user);
      return { token, user };
    },

    // Resolver for adding a new user
    addUser: async (parent, { username, email, password }) => {
      // Create a new user in the database
      const user = await User.create(
        {
          username: username,
          email: email,
          password: password,
        }
      );

      // Sign a token for the new user
      const token = signToken(user);
      return { token, user };
    },

    // Resolver for saving a book to user's savedBooks array
    saveBook: async (parent, { bookInput }, context) => {
      // Check if user exists in context
      if (context.user) {
        // Update the user's savedBooks array by adding a new book
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookInput }},
          { new: true }
        );

        return updatedUser;
      }

      throw new Error("User not found");
    },

    // Resolver for removing a book from user's savedBooks array
    removeBook: async (parent, args, context) => {
      // Check if user exists in context
      if (context.user) {
        // Update the user's savedBooks array by removing a book
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: args }},
          { new: true }
        );

        return updatedUser;
      }

      throw new Error("User not found");
    },
  },
};

module.exports = resolvers;
