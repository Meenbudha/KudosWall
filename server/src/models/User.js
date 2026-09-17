const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const badgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String, default: '🏆' },
  description: { type: String },
  earnedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 60
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: function() {
      const sanitized = encodeURIComponent(this.name || 'User');
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${sanitized}`;
    }
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Developer', 'Design', 'Marketing', 'Sales', 'Product', 'HR'],
    default: 'Developer'
  },
  givingAllowance: {
    type: Number,
    default: 100,
    min: [0, 'Allowance cannot be negative']
  },
  earnedPoints: {
    type: Number,
    default: 0,
    min: [0, 'Earned points cannot be negative']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  refreshTokens: {
    type: [String],
    default: []
  },
  badges: {
    type: [badgeSchema],
    default: []
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Compute dynamic badges milestone
userSchema.methods.evaluateBadges = function(kudosSentCount, kudosReceivedCount) {
  const existingBadgeIds = new Set(this.badges.map(b => b.id));
  const newBadges = [];

  const catalog = [
    {
      id: 'first_kudos',
      name: 'Culture Starter',
      icon: '🌱',
      description: 'Sent your very first peer kudos!',
      check: () => kudosSentCount >= 1
    },
    {
      id: 'generous_heart',
      name: 'Generous Heart',
      icon: '💖',
      description: 'Recognized peers 5 or more times.',
      check: () => kudosSentCount >= 5
    },
    {
      id: 'rising_star',
      name: 'Rising Star',
      icon: '⭐',
      description: 'Earned 50+ points from teammates.',
      check: () => this.earnedPoints >= 50
    },
    {
      id: 'century_club',
      name: 'Century Champion',
      icon: '🏆',
      description: 'Crossed 100+ earned points!',
      check: () => this.earnedPoints >= 100
    },
    {
      id: 'team_pillar',
      name: 'Team Pillar',
      icon: '🏛️',
      description: 'Received recognition from 3+ distinct colleagues.',
      check: () => kudosReceivedCount >= 3
    }
  ];

  for (const b of catalog) {
    if (!existingBadgeIds.has(b.id) && b.check()) {
      newBadges.push({
        id: b.id,
        name: b.name,
        icon: b.icon,
        description: b.description,
        earnedAt: new Date()
      });
    }
  }

  if (newBadges.length > 0) {
    this.badges.push(...newBadges);
    return true;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
