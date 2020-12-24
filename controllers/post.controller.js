const moment = require('moment');
const Comments = require('../models/Comments');
const Post = require('../models/Post');
const PostLikes = require('../models/PostLikes');


module.exports.createPost = async (req, res, next) => {
  const user = res.locals.user;
  // this user creates posts who is logged in
  const { image, title, description } = req.body;
  try { 
    const post = new Post({ author: user._id, image, title, description });
    await post.save();
    const postLikes = new PostLikes({ post: post._id });
    await postLikes.save();

    res.status(200).send({
      postLikes: [],
      comments: [],
      author: user.username,
      image: post.image,
      title: post.title,
      description: post.description,
      time: moment.duration(post.time-Date.now()).humanize(),
      "_id": post._id
    });
  } catch (err) {
    next(err);
  }
};

module.exports.retrieveAllPosts = async (req, res, next) => {
  const user = res.locals.user;
  const { offset = 0 } = req.params;
  // pagination to be done

  try {
    // since no followers or following is there, i'm getting all posts
    const posts = await Post.aggregate([
      { $sort: { date: -1 } },
      { $skip: Number(offset) },
      { $limit: 12 },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $lookup: {
          from: 'postlikes',
          localField: '_id',
          foreignField: 'post',
          as: 'likes',
        },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'post',
          as: 'comments',
        },
      },
      {
        $project: {
          "_id": true,
          "author.username": true,
          "author._id": true,
          "image": true,
          "title": true,
          "description": true,
          "time": moment.duration('$time'-Date.now()).humanize(),
          "likes": true,
          "comments.author": true,
          "comments.message": true,
          "comments.date": moment.duration("$comments.date"-Date.now()).humanize(),
          "commentsLength": { $size: '$comments' },
        }
      }
    ]);
    /*
    
    */
    // TODO add more detail to the query after asking
    if (posts.length == 0) return res.status(200).send({ error: 'Be the first one to post' });
    return res.send(posts);
  } catch (err) {
    next(err);
  }
};

module.exports.likePost = async (req, res, next) => {
  const { postId } = req.params;
  const user = res.locals.user;

  try {
    const afterLike = await PostLikes.updateOne(
      { post: postId, 'votes.author': { $ne: user._id } },
      { $push: { votes: { author: user._id } } }
    );
    // checks if the user already likes if not then like

    if (!afterLike.nModified) {
      if (!afterLike.ok) return res.status(500).send({ error: 'Could not like' });
      const afterRemoveLike = await PostLikes.updateOne(
        { post: postId },
        { $pull: { votes: { author: user._id } } },
      );
      // if like then remove it, I did this for my other personal project after a lot of research thats why I know this beforehand
      if (!afterRemoveLike.nModified) return res.status(500).send({ error: 'Could not remove like' });
      return res.status(200).send('Disliked post');
    }
    return res.status(200).send('Liked post')
  } catch (err) {
    next(err);
  }
};

module.exports.createComment = async (req, res, next) => {
  const { postId } = req.params;
  const { message } = req.body;
  const user = res.locals.user;

  if (!postId) return res.status(400).send({ error: 'Please provide your post id' }); // Not user friendly but for now
  if (!message) return res.status(400).send({ error: 'Please provide your comment' });

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).send({ error: 'Could not find post' });
    const comment = new Comments({ post: postId, author: user._id, message });
    await comment.save();
    res.status(201).send({
      ...comment.toObject(),
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};