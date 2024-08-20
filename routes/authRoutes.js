const express = require('express');
const authController = require('../controllers/authController');
const jwtMiddleware = require('../middleware/jwtMiddleware');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', jwtMiddleware.verifyToken, authController.getUserProfile);
router.put('/profile', jwtMiddleware.verifyToken, authController.updateProfile);

module.exports = router;