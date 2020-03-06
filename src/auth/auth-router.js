const express = require('express');

const authRouter = express.Router();
const jsonParser = express.json();

authRouter
  .route('/login')
  .post(jsonParser, (req, res, next) => {
    const { user_name, password } = req.body;
    const loginUser =  { user_name, password };

    for (const [key, value] of Object.entries(loginUser)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    res.send('ok');
  });

module.exports = authRouter;