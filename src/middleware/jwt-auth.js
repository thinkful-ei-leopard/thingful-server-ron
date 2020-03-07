const AuthService = require('../auth/auth-service');

function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';

  let bearerToken;
  if(!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  } else {
    // removes the prefixed 'bearer ' from the token, leaving just the value
    bearerToken = authToken.slice('bearer '.length, authToken.length); 
  }

  try {
    const payload = AuthService.verifyJwt(bearerToken);

    AuthService.getUserWithUserName(
      req.app.get('db'),
      payload.sub
    )
      .then(user => {
        if(!user) {
          return res.status(401).json({ error: 'Unauthorized request' });
        }
        req.user = user;
        next();
      })
      .catch(err => {
        console.log(err);
        next(err);
      });
  } catch(err) {
    res.status(401).json({ error: 'Unauthorized request' });
  }
}

module.exports = { 
  requireAuth
};