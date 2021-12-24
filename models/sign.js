const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const signSchema = new Schema({

    username: {
        type : String,
        required:true,
    },

    password: {
      type: String,
    },
  });
  
  const Sign = mongoose.model('Sign', signSchema);
  module.exports = Sign;