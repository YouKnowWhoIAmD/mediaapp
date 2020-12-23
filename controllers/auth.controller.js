const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports.verifyJwt = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      token = token.replace("Bearer ","");
      const id = jwt.decode(token, process.env.JWT_SECRET).id; 
      const user = await User.findOne(
        { _id: id },
        '_id username'
      ); // get fields depending on the usage
      if (user) {
        return resolve(user);
      }
      return reject('Not authorized');
    } catch (err) {
      return reject('Not authorized');
    }
  });
};

module.exports.requireAuth = async (req, res, next) => {
  // auth from headers, lets suppose not a bearer
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).send({ error: 'Not authorized' });
  try {
    const user = await this.verifyJwt(authorization);
    res.locals.user = user;
    return next();
  } catch (err) {
    return res.status(401).send({ error: err });
  }
};

module.exports.optionalAuth = async (req, res, next) => {
  // auth from headers, lets suppose not a bearer
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).send({ error: 'Not authorized' });
  try {
    const user = await this.verifyJwt(authorization);
    res.locals.user = user;
  } catch (err) {
    return res.status(401).send({ error: err });
  }
  return next();
};

module.exports.loginAuthentication = async (req, res, next) => {
  const { authorization } = req.headers;
  const { username, password } = req.body;
  // if not authorization token can be given too
  // otherwise default uname and pwd
  if (authorization) {
    try {
      const user = await this.verifyJwt(authorization);
      return res.send({
        user,
        token: authorization.replace("Bearer ",""),
      });
    } catch (err) {
      return res.status(401).send({ error: err });
    }
  }

  if (!username || !password) return res.status(400).send({ error: 'Please provide both userame and passwrod' });

  try {
    const user = await User.findOne({
      username: username
    });
    if (!user || !user.password) return res.status(401).send({ error: 'Cant fetch the user' });
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return next(err);
      if (!result) return res.status(401).send({ error: 'Incorrect credentials' });
      res.status(200).send({
        user: {
          username: user.username,
          _id: user._id,
        },
        token: jwt.encode({ id: user._id }, process.env.JWT_SECRET),
      });
    });
  } catch (err) {
    next(err);
  }
};

module.exports.register = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send({ error: 'Please provide both userame and passwrod' });

  try {
    const user = await User.findOne({
      username: username
    });
    if (user) return res.status(401).send({ error: 'Another user exists' });
    const newUser = new User({ username, password });
    newUser.save();
    return res.status(200).send('User is created');
  } catch (err) {
    next(err);
  }
}