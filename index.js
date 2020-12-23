const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const apiRouter = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use('/api', apiRouter);

(async function() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    throw new Error(err);
  }
})();

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err.message);
  // Any other error handling if required
  res.status(err.statusCode).send({
    error:
      err.statusCode >= 500
        ? 'An unexpected error ocurred'
        : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});