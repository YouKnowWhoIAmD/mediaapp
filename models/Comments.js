const mongoose = require('mongoose');
const Post = require('./Post');
const Schema = mongoose.Schema;

const CommentsSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  author: { 
    type: Schema.Types.ObjectId,
     ref: 'User',
  },
  message: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

const Comments = mongoose.model('Comments', CommentsSchema);
module.exports = Comments;