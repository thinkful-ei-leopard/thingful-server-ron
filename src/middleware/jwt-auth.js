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
    // this will try to verify the JWT token, if it doesn't verify this code will error and
    // the try block will skip to the catch(err) block
    AuthService.verifyJwt(bearerToken);
    next();
  } catch(err) {
    res.status(401).json({ error: 'Unauthorized request' });
  }
}

module.exports = requireAuth;