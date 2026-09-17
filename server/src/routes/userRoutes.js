const express = require('express');
const router = express.Router();
const {
  getUsersDirectory,
  getUserProfile,
  updateProfile
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getUsersDirectory);
router.get('/:id/profile', optionalAuth, getUserProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
