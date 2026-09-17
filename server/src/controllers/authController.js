const crypto = require('crypto');
const User = require('../models/User');
const {
  generateTokens,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies
} = require('../utils/tokenUtils');
const emailSimulator = require('../utils/emailSimulator');

/**
 * Register a new user
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and department.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Generate random email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      department,
      givingAllowance: 100,
      earnedPoints: 0,
      isVerified: false,
      verificationToken
    });

    // Send simulated email
    const mailItem = emailSimulator.sendVerificationEmail(user.email, verificationToken, user.name);

    res.status(201).json({
      success: true,
      message: 'Signup successful! Please verify your email using the link sent.',
      simulatedEmail: {
        to: user.email,
        token: verificationToken,
        actionUrl: mailItem.actionUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email address
 * POST /api/auth/verify-email
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token, email } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required.'
      });
    }

    const query = { verificationToken: token };
    if (email) query.email = email.toLowerCase();

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    // Issue tokens
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshTokens.push(refreshToken);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Email successfully verified. You are now logged in!',
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

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before logging in. Check simulated inbox.',
        email: user.email,
        verificationToken: user.verificationToken
      });
    }

    // Generate tokens and rotate
    const { accessToken, refreshToken } = generateTokens(user);

    // Limit stored refresh tokens to prevent unbounded growth (max 5 devices)
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens.shift();
    }
    user.refreshTokens.push(refreshToken);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
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

/**
 * Token Rotation & Refresh
 * POST /api/auth/refresh
 */
const refreshTokenHandler = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({
        success: false,
        code: 'NO_REFRESH_TOKEN',
        message: 'Refresh token missing.'
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(oldRefreshToken);
    } catch (err) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        code: 'REFRESH_EXPIRED',
        message: 'Refresh token expired or invalid. Please log in again.'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Token reuse detection: check if old token is in database
    const tokenIndex = user.refreshTokens.indexOf(oldRefreshToken);
    if (tokenIndex === -1) {
      // Possible token theft / reuse! Invalidate all refresh tokens for security
      user.refreshTokens = [];
      await user.save();
      clearAuthCookies(res);
      return res.status(403).json({
        success: false,
        code: 'TOKEN_REUSE_DETECTED',
        message: 'Suspicious session detected. All sessions revoked. Please log in again.'
      });
    }

    // Rotate tokens: remove used refresh token, generate new pair
    user.refreshTokens.splice(tokenIndex, 1);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    setAuthCookies(res, accessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Tokens rotated and refreshed successfully.',
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

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token && req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== token);
        await user.save();
      }
    }

    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password request
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return 200 to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been simulated.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const mailItem = emailSimulator.sendPasswordResetEmail(user.email, resetToken, user.name);

    res.status(200).json({
      success: true,
      message: 'Password reset link simulated successfully.',
      simulatedEmail: {
        to: user.email,
        token: resetToken,
        actionUrl: mailItem.actionUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = []; // Revoke previous sessions
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        avatar: user.avatar,
        givingAllowance: user.givingAllowance,
        earnedPoints: user.earnedPoints,
        badges: user.badges,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get simulated inbox for demo / testing
 * GET /api/auth/simulated-inbox
 */
const getSimulatedInbox = (req, res) => {
  res.status(200).json({
    success: true,
    emails: emailSimulator.getSimulatedEmails()
  });
};

module.exports = {
  signup,
  verifyEmail,
  login,
  refreshTokenHandler,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  getSimulatedInbox
};
