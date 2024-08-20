const authService = require('../services/authService');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  console.log(req.body);
  const { name, email, phone, address, state, password, role } = req.body;

  const result = await authService.registerUser(name, email, phone, address, state, password ,role);

  if (result.success) {
    res.status(201).json({ message: 'Registration successful!' });
  } else {
    res.status(400).json({ message: result.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.loginUser(email, password);

  if (result.success) {
    res.status(200).json({ success: true, token: result.token, details: result.details });
  } else {
    res.status(401).json({ message: result.message });
  }
};

exports.getUserProfile = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'A token is required for authentication' });
  }

  try {
    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const result = await authService.getUserDetailsById(userId);
    if (!result.success) {
      return res.status(404).json({ message: result.message });
    }
    return res.status(200).json(result.user);

  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
      const updatedUser = await authService.updateUser(req.user.id, req.body);
      res.json({ success: true, user: updatedUser });
  } catch (err) {
      res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};