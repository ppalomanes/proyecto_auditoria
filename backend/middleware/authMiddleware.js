const jwt = require('jsonwebtoken');

function checkAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).send('Token requerido');

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(403).send('Token inválido');
  }
}

module.exports = checkAuth;
