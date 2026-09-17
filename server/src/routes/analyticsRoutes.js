const express = require('express');
const router = express.Router();
const {
  getLeaderboard,
  getAnalyticsSummary,
  resetMonthlyAllowance
} = require('../controllers/analyticsController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/leaderboard', optionalAuth, getLeaderboard);
router.get('/summary', optionalAuth, getAnalyticsSummary);
router.post('/reset-monthly-allowance', protect, resetMonthlyAllowance);

module.exports = router;
