require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const { NODE_ENV } = require('./config');
const thingsRouter = require('./things/things-router');
const reviewsRouter = require('./reviews/reviews-router');
const authRouter = require('./auth/auth-router');

const app = express();

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test',
}));
app.use(cors());
app.use(helmet());

app.use('/api/things', thingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/auth', authRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: 'Server error' };
  } else {
    console.error(error);
    response = { error: error.message, object: error };
    if(error.errno === -4078) {
      console.log('ERROR: PSQL database not running')
      response = { 
        error: error.message,
        object: error,
        details: 'PSQL database not running'};
    }
  }
  res.status(500).json(response);
});

module.exports = app;
