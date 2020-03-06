const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const jsonParser = express.json();

authRouter
  .route('/login')
  .post(jsonParser, (req, res, next) => {  // WHY unexpected token??
    const { user_name, password } = req.body;
    const loginUser =  { user_name, password };

    for (const [key, value] of Object.entries(loginUser)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }
    // console.log(`LINE 20:`, loginUser);
    AuthService.getUserWithUserName(
      req.app.get('db'),
      loginUser.user_name
    )
      .then(dbUser => {
        // console.log(`LINE 26:`, dbUser);
        if(!dbUser) {
          // console.log(`LINE 27: this user doesnt exist`);
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        //console.log('this user DOES exist');
        
        return AuthService.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => {
            if (!compareMatch) {
              return res.status(401).json({
                error: 'Incorrect user_name or password',
              });
            }

            res.send('ok');
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