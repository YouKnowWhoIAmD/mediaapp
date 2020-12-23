const mongoose = require('mongoose');
const Post = require('./Post');
const Schema = mongoose.Schema;

const PostLikesSchema = new Schema({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  votes: [{ author: { type: Schema.Types.ObjectId, ref: 'User' } } ]
});

const PostLikes = mongoose.model('PostLikes', PostLikesSchema);
module.exports = PostLikes;