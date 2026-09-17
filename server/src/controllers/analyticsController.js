const mongoose = require('mongoose');
const Kudos = require('../models/Kudos');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

/**
 * Monthly Leaderboard powered by MongoDB Aggregation Pipelines ($match, $group, $lookup, $sort, $limit)
 * GET /api/analytics/leaderboard
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const { department, timeframe } = req.query;

    // Determine timeframe filter: current month by default
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1); // 1st day of current month

    if (timeframe === 'all_time') {
      startDate = new Date(0); // Epoch
    } else if (timeframe === 'last_30_days') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchStage = {
      $match: {
        createdAt: { $gte: startDate }
      }
    };

    const groupStage = {
      $group: {
        _id: '$receiver',
        totalPoints: { $sum: '$points' },
        kudosCount: { $sum: 1 },
        valuesReceived: { $addToSet: '$companyValue' },
        uniqueSenders: { $addToSet: '$sender' }
      }
    };

    const lookupStage = {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    };

    const unwindStage = {
      $unwind: '$user'
    };

    const projectStage = {
      $project: {
        _id: 1,
        totalPoints: 1,
        kudosCount: 1,
        valuesReceived: 1,
        senderDiversityCount: { $size: '$uniqueSenders' },
        'user._id': 1,
        'user.name': 1,
        'user.email': 1,
        'user.avatar': 1,
        'user.department': 1,
        'user.badges': 1
      }
    };

    const pipeline = [matchStage, groupStage, lookupStage, unwindStage, projectStage];

    // Filter by department if specified
    if (department && department !== 'ALL') {
      pipeline.push({
        $match: { 'user.department': department }
      });
    }

    // Sort by total points received descending, then by kudos count
    pipeline.push({
      $sort: { totalPoints: -1, kudosCount: -1 }
    });

    // Limit top 20
    pipeline.push({ $limit: 20 });

    const leaderboard = await Kudos.aggregate(pipeline);

    // Format with rank numbers (1, 2, 3...)
    const ranked = leaderboard.map((item, index) => ({
      rank: index + 1,
      userId: item.user._id,
      name: item.user.name,
      email: item.user.email,
      avatar: item.user.avatar,
      department: item.user.department,
      badges: item.user.badges,
      totalPoints: item.totalPoints,
      kudosCount: item.kudosCount,
      valuesReceived: item.valuesReceived,
      senderDiversityCount: item.senderDiversityCount
    }));

    res.status(200).json({
      success: true,
      data: ranked,
      timeframe: timeframe || 'current_month',
      department: department || 'ALL'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Company-wide Analytics & Values Distribution
 * GET /api/analytics/summary
 */
const getAnalyticsSummary = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalKudos = await Kudos.countDocuments();

    // Total points distributed
    const pointsSumAgg = await Kudos.aggregate([
      { $group: { _id: null, totalPoints: { $sum: '$points' } } }
    ]);
    const totalPointsGiven = pointsSumAgg[0]?.totalPoints || 0;

    // Company value distribution
    const valuesAgg = await Kudos.aggregate([
      { $group: { _id: '$companyValue', count: { $sum: 1 }, totalPoints: { $sum: '$points' } } },
      { $sort: { count: -1 } }
    ]);

    // Department points breakdown
    const deptAgg = await User.aggregate([
      {
        $group: {
          _id: '$department',
          memberCount: { $sum: 1 },
          totalEarnedPoints: { $sum: '$earnedPoints' }
        }
      },
      { $sort: { totalEarnedPoints: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalKudos,
        totalPointsGiven,
        companyValues: valuesAgg,
        departmentBreakdown: deptAgg
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Monthly Allowance Reset Logic
 * Resets all users' givingAllowance back to 100 points
 * POST /api/analytics/reset-monthly-allowance
 */
const resetMonthlyAllowance = async (req, res, next) => {
  try {
    // 1. Reset all users' giving allowance to 100
    const result = await User.updateMany(
      {},
      { $set: { givingAllowance: 100 } }
    );

    // 2. Record Transaction log
    await Transaction.create({
      type: 'MONTHLY_ALLOWANCE_RESET',
      points: 100,
      notes: `Refreshed giving allowance to 100 for ${result.modifiedCount} users by ${req.user?.name || 'System Scheduler'}`
    });

    console.log(`[Allowance Reset] Refreshed allowance for ${result.modifiedCount} users.`);

    res.status(200).json({
      success: true,
      message: `🎉 Successfully refreshed monthly giving allowance to 100 points for all ${result.modifiedCount} team members!`,
      affectedUsersCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
  getAnalyticsSummary,
  resetMonthlyAllowance
};
