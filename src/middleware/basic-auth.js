const bcrypt = require('bcryptjs');
const AuthService = require('../auth/auth-service');

function requireAuth(req,res,next) {
  const authToken = req.get('Authorization') || '';
  let basicToken;
  
  // If the authToken we receive doesn't start wtih 'basic ' returns 401 (e.g. its not a basic token)
  if (!authToken.toLowerCase().startsWith('basic ')) {
    return res.status(401).json({ error: 'Missing basic token' });
  } else {
    // if authToken is valid, remove the 'basic ' that prepends the actual token value
    // IE. INPUT: 'basic steve:PASSWORD123' OUTPUT: 'steve:PASSWORD123' 
    // NOTE: In reality, our token values at this point are NOT in cleartext, 
    // they are in base64 so it might look like "basic 5322424262525" originally
    basicToken = authToken.slice('basic '.length, authToken.length);
  }

  // This our token value which is currently in base64 and parses it into a string, 
  // then removes the ":" between our username and password and returns them to tokenUserName and tokenPassword
  // I.E. INPUT: "5322424262525" OUTPUT: tokenUserName='steve' tokenPassword='PASSWORD123'  
  const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken);

  if (!tokenUserName || !tokenPassword) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
 
  AuthService.getUserWithUserName(
    req.app.get('db'),
    tokenUserName
  )
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized request' });
      }
      
      return bcrypt.compare(tokenPassword, user.password)
        .then(passwordsMatch => {
          if (!passwordsMatch) {
            return res.status(401).json({ error: 'Unauthorized request' });
          }

          req.user = user;
          next();
        });
    })
    .catch(next);
}

module.exports = {
  requireAuth,
};