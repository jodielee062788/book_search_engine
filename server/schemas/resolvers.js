const { User } = require('../models');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
      me: async (parent, args, context) => {
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password');
          return userData;
        }
        throw new Error('You need to log in first!');
    },
},
    Mutation: {
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("This user can't be found");
        }
      
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new Error('Incorrect Password!');
        }
      
        const token = signToken(user);
        return { token, user };
      },
      addUser: async (parent, args) => {
        const user = await User.create(args);
            
        if (!user) {
          throw new Error("Can't create user!");
        }
            
        const token = signToken(user);
        return { token, user };
      },
      saveBook: async (parent, { book }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: book } },
            { new: true, runValidators: true }
          );
              
          return updatedUser;
        }
          throw new Error('You need to log in first!');
      },
      removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          );
              
          if (!updatedUser) {
            throw new Error("This user can't be found");
          }
              
          return updatedUser;
        }
          throw new Error('You need to log in first!');
       },    
    },
};
      
module.exports = resolvers;