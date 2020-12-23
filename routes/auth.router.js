const express = require('express');
const authRouter = express.Router();

const {
  loginAuthentication,
  register
} = require('../controllers/auth.controller');

authRouter.post('/login', loginAuthentication);
authRouter.post('/register', register);

module.exports = authRouter;