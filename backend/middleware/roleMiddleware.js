function checkRole(...allowedRoles) {
    return (req, res, next) => {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).send('Acceso denegado por rol');
      }
      next();
    };
  }
  
  module.exports = checkRole;
  