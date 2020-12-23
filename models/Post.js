const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  image: String,
  title: String,
  description: String,
  time: {
    type: Date,
    default: Date.now
  }
});

PostSchema.pre('deleteOne', async function(next) {
  const postId = this.getQuery()['_id'];
  try {
    await mongoose.model('PostLikes').deleteOne({ post: postId });
    await mongoose.model('Comments').deleteOne({ post: postId });
    next();
  } catch (err) {
    next(err);
  }
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;