const express = require('express');
const authRouter = require('./auth.router');
const postRouter = require('./post.router');

const apiRouter = express.Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/post', postRouter);

module.exports = apiRouter;