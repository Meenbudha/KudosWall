const express = require('express');
const router = express.Router();
const {
  signup,
  verifyEmail,
  login,
  refreshTokenHandler,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  getSimulatedInbox
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/refresh', refreshTokenHandler);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.get('/simulated-inbox', getSimulatedInbox);

module.exports = router;
