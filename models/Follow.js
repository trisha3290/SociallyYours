const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followSchema = new Schema({
    followedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    following_user: {
      type: String,
      required: true,
    },


    author_username: {
      type: String,
      required: true,
    },
    
    author_avatar: {
      type: String,
      required: true,
    },
    
  });
  
  const Follow= mongoose.model('Follow', followSchema);
  module.exports = Follow;