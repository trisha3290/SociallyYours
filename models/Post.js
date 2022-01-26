const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required:true,
  },
  body: {
    type: String,
    required:true,
  },
  author:{
    type: String,
    required:true,
  },
  avatar: {
    type: String,
  },
  createdDate: {
    type: Date,
    index : true,
  },
});

postSchema.index({'$**': 'text'});

const Post= mongoose.model('Post', postSchema);
module.exports = Post;