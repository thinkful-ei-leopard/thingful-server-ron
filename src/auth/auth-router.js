const express = require('express');
const AuthService = require('./auth-service');

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

    AuthService.getUserWithUserName(
      req.app.get('db'),
      loginUser.user_name
    )
      .then(dbUser => {
        if(!dbUser) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        
        return AuthService.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => {
            if (!compareMatch) {
              return res.status(401).json({
                error: 'Incorrect user_name or password',
              });
            }

            const sub = dbUser.user_name;
            const payload = { user_id: dbUser.id };
            res.send({
              authToken: AuthService.createJwt(sub, payload)
            });
          });
      })
      .catch(next);
    // Attempt to get the username from the DB, if it doesnt exist respond 400
    // try{
    //     const user = await AuthService.getUserWithUserName(
    //         req.app.get('db'),
    //         loginUser.user_name
    //       );
      
    //       if(!user) {
    //           return res.status(401).json({ error: 'Invalid credentials' });
    //       }

    //       res.send('ok');
    // } 
    // catch(err) {
    //     next();
    // }

    // DO I WRAP THIS IN A TRY CATCH? WHERE DO I PUT NEXT???


  });

module.exports = authRouter;