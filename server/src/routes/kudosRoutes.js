const express = require('express');
const router = express.Router();
const {
  giveKudos,
  getKudosFeed,
  toggleReaction,
  getKudosById
} = require('../controllers/kudosController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', protect, giveKudos);
router.get('/', optionalAuth, getKudosFeed);
router.get('/:id', optionalAuth, getKudosById);
router.post('/:id/react', protect, toggleReaction);

module.exports = router;
