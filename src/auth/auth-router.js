const express = require('express');

const authRouter = express.Router();

authRouter
  .post('/login', (req, res, next) => {
    res.send('ok');
  });

module.export = authRouter;