const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followSchema = new Schema({
    followedId: {
      type: String,
      required: true,
    },

    authorId: {
      type: String,
      required: true,
    },

    following_user: {
      type: String,
      required: true,
    },
    
  });
  
  const Follow= mongoose.model('Follow', followSchema);
  module.exports = Follow;