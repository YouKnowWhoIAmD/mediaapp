const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Please enter your username'],
    unique: [true, 'Username is taken'],
    trim: true,
    minlength: [3, 'Please enter a minimum of 3 characters in username']
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minlength: [4, 'Password is too short'],
  }
});

UserSchema.pre('save', async function(next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;