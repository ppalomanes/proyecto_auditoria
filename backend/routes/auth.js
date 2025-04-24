const express = require('express');
const router = express.Router();
const { login, register, verifyEmail, forgotPassword, resetPassword } = require('../controllers/authController');
const checkAuth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

router.post('/login', login);
router.post('/register', checkAuth, checkRole('admin'), register);
router.get('/verify/:token', verifyEmail);
router.post('/forgot', forgotPassword);
router.post('/reset', resetPassword);

module.exports = router;
