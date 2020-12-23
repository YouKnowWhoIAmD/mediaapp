const express = require('express');
const multer = require('multer');
const postRouter = express.Router();

const { 
  retrieveAllPosts, 
  createPost, 
  likePost, 
  createComment 
} = require('../controllers/post.controller');
const {
  requireAuth,
  optionalAuth
} = require('../controllers/auth.controller');

const uploadDir = multer({
  dest: 'upload/'
});

postRouter.get('/:offset', optionalAuth, retrieveAllPosts);

postRouter.post('/create', requireAuth, uploadDir.single("file"), createPost);
postRouter.post('/:postId/like', requireAuth, likePost);
postRouter.post('/:postId/comment', requireAuth, createComment);

module.exports = postRouter;