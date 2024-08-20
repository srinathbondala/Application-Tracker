const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
      return res.status(403).json({ success: false, message: 'A token is required for authentication' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
  } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

exports.isUser = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
      return res.status(403).json({ success: false, message: 'A token is required for authentication' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (req.user.role !== 'user') {
        return res.status(403).send('Access denied. User role required.');
      }
      next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

exports.isAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
      return res.status(403).json({ success: false, message: 'A token is required for authentication' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (req.user.role !== 'admin') {
        return res.status(403).send('Access denied. Admin role required.');
      }
      next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
