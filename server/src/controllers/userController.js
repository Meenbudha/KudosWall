const User = require('../models/User');
const Kudos = require('../models/Kudos');

/**
 * Get public list of users for autocomplete / team directory
 * GET /api/users
 */
const getUsersDirectory = async (req, res, next) => {
  try {
    const { search, department } = req.query;
    const filter = {};

    if (department && department !== 'ALL') {
      filter.department = department;
    }

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    const users = await User.find(filter)
      .select('name email avatar department earnedPoints givingAllowance badges')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single user profile with kudos history (received vs sent) and badges
 * GET /api/users/:id/profile
 */
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Kudos received by this user
    const receivedKudos = await Kudos.find({ receiver: userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email avatar department');

    // Kudos sent by this user
    const sentKudos = await Kudos.find({ sender: userId })
      .sort({ createdAt: -1 })
      .populate('receiver', 'name email avatar department');

    // Aggregate statistics
    const stats = {
      totalPointsReceived: user.earnedPoints,
      totalPointsGiven: sentKudos.reduce((acc, k) => acc + (k.points || 0), 0),
      countReceived: receivedKudos.length,
      countSent: sentKudos.length,
      remainingAllowance: user.givingAllowance,
      badgesCount: user.badges.length
    };

    res.status(200).json({
      success: true,
      data: {
        user,
        stats,
        receivedKudos,
        sentKudos
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, department, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (department) user.department = department;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        avatar: user.avatar,
        givingAllowance: user.givingAllowance,
        earnedPoints: user.earnedPoints,
        badges: user.badges
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsersDirectory,
  getUserProfile,
  updateProfile
};
