const mongoose = require('mongoose');
const Kudos = require('../models/Kudos');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const ALLOWED_VALUES = ['#Teamwork', '#CustomerObsession', '#Innovation', '#Leadership', '#BiasForAction'];
const ALLOWED_EMOJIS = ['+1', '👏', '🔥', '❤️', '🚀'];

/**
 * Give Kudos (Peer Recognition Point Transaction)
 * POST /api/kudos
 */
const giveKudos = async (req, res, next) => {
  const senderId = req.user._id.toString();
  const { receiverId, points, message, companyValue } = req.body;

  try {
    // 1. Basic validation
    if (!receiverId || !points || !message || !companyValue) {
      return res.status(400).json({
        success: false,
        message: 'Receiver, points, message, and company value tag are all required.'
      });
    }

    const pointAmount = parseInt(points, 10);
    if (isNaN(pointAmount) || pointAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Points must be a positive integer.'
      });
    }

    if (!ALLOWED_VALUES.includes(companyValue)) {
      return res.status(400).json({
        success: false,
        message: `Invalid company value tag. Allowed: ${ALLOWED_VALUES.join(', ')}`
      });
    }

    // 2. Anti-fraud: prevent self-gifting
    if (senderId === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Anti-fraud policy violation: You cannot give kudos or points to yourself.'
      });
    }

    // 3. Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found.'
      });
    }

    // 4. Atomic balance deduction from sender
    // Using conditional atomic query: givingAllowance >= pointAmount
    const sender = await User.findOneAndUpdate(
      {
        _id: senderId,
        givingAllowance: { $gte: pointAmount }
      },
      {
        $inc: { givingAllowance: -pointAmount }
      },
      { new: true }
    );

    if (!sender) {
      return res.status(400).json({
        success: false,
        message: `Insufficient giving allowance. You only have ${req.user.givingAllowance} points left this month.`
      });
    }

    let kudosRecord;
    let transactionRecord;

    try {
      // 5. Credit receiver earnedPoints atomically
      const updatedReceiver = await User.findByIdAndUpdate(
        receiverId,
        { $inc: { earnedPoints: pointAmount } },
        { new: true }
      );

      // 6. Create Kudos Post
      kudosRecord = await Kudos.create({
        sender: senderId,
        receiver: receiverId,
        points: pointAmount,
        message: message.trim(),
        companyValue,
        reactions: [
          { emoji: '+1', users: [] },
          { emoji: '👏', users: [] },
          { emoji: '🔥', users: [] },
          { emoji: '❤️', users: [] },
          { emoji: '🚀', users: [] }
        ]
      });

      // 7. Record Transaction Audit Log
      transactionRecord = await Transaction.create({
        type: 'KUDOS_GIFT',
        sender: senderId,
        receiver: receiverId,
        points: pointAmount,
        kudosId: kudosRecord._id,
        notes: `Kudos given under ${companyValue}`
      });

      // 8. Dynamic Badge Evaluation for sender & receiver
      const senderSentCount = await Kudos.countDocuments({ sender: senderId });
      const senderReceivedCount = await Kudos.countDocuments({ receiver: senderId });
      if (sender.evaluateBadges(senderSentCount, senderReceivedCount)) {
        await sender.save();
      }

      const receiverSentCount = await Kudos.countDocuments({ sender: receiverId });
      const receiverReceivedCount = await Kudos.countDocuments({ receiver: receiverId });
      if (updatedReceiver.evaluateBadges(receiverSentCount, receiverReceivedCount)) {
        await updatedReceiver.save();
      }

    } catch (innerError) {
      // Compensation / Rollback if sub-operations fail
      console.error('[Kudos Transaction Rollback Triggered]:', innerError);
      await User.findByIdAndUpdate(senderId, { $inc: { givingAllowance: pointAmount } });
      if (kudosRecord) await Kudos.findByIdAndDelete(kudosRecord._id);
      throw innerError;
    }

    // Populate sender and receiver for instant client feed prepend
    const populatedKudos = await Kudos.findById(kudosRecord._id)
      .populate('sender', 'name email avatar department')
      .populate('receiver', 'name email avatar department');

    res.status(201).json({
      success: true,
      message: `🎉 Successfully sent ${pointAmount} kudos points to ${receiver.name}!`,
      kudos: populatedKudos,
      updatedSenderAllowance: sender.givingAllowance
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Social Kudos Feed (with pagination, filtering, search)
 * GET /api/kudos
 */
const getKudosFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { companyValue, department, search } = req.query;

    const filter = {};

    if (companyValue && companyValue !== 'ALL') {
      filter.companyValue = companyValue;
    }

    // Query Kudos with population
    let query = Kudos.find(filter)
      .sort({ createdAt: -1 })
      .populate('sender', 'name email avatar department')
      .populate('receiver', 'name email avatar department');

    let kudosList = await query.lean();

    // In-memory filter for populated fields if department or search specified
    if (department && department !== 'ALL') {
      kudosList = kudosList.filter(k => 
        k.receiver?.department === department || k.sender?.department === department
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      kudosList = kudosList.filter(k =>
        k.receiver?.name.toLowerCase().includes(q) ||
        k.sender?.name.toLowerCase().includes(q) ||
        k.message.toLowerCase().includes(q)
      );
    }

    const totalCount = kudosList.length;
    const paginatedItems = kudosList.slice(skip, skip + limit);
    const hasMore = skip + limit < totalCount;

    res.status(200).json({
      success: true,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Emoji Reaction on a Kudos card (Optimistic friendly)
 * POST /api/kudos/:id/react
 */
const toggleReaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id.toString();

    if (!ALLOWED_EMOJIS.includes(emoji)) {
      return res.status(400).json({
        success: false,
        message: `Invalid emoji. Allowed: ${ALLOWED_EMOJIS.join(' ')}`
      });
    }

    const kudos = await Kudos.findById(id);
    if (!kudos) {
      return res.status(404).json({
        success: false,
        message: 'Kudos not found.'
      });
    }

    // Single emoji reaction per user per Kudos:
    // Remove user from any previously reacted emoji group on this post
    let previouslyReactedEmoji = null;
    kudos.reactions.forEach(group => {
      const idx = group.users.findIndex(u => (u._id || u).toString() === userId);
      if (idx > -1) {
        previouslyReactedEmoji = group.emoji;
        group.users.splice(idx, 1);
      }
    });

    let action;
    if (previouslyReactedEmoji === emoji) {
      // User clicked the exact same emoji -> toggle off / unreact
      action = 'removed';
    } else {
      // User reacted with a new emoji -> add to the selected emoji group
      let reactionGroup = kudos.reactions.find(r => r.emoji === emoji);
      if (!reactionGroup) {
        kudos.reactions.push({ emoji, users: [] });
        reactionGroup = kudos.reactions[kudos.reactions.length - 1];
      }
      reactionGroup.users.push(req.user._id);
      action = 'added';
    }

    await kudos.save();

    res.status(200).json({
      success: true,
      action,
      emoji,
      reactions: kudos.reactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get individual Kudos by ID
 * GET /api/kudos/:id
 */
const getKudosById = async (req, res, next) => {
  try {
    const kudos = await Kudos.findById(req.params.id)
      .populate('sender', 'name email avatar department')
      .populate('receiver', 'name email avatar department');

    if (!kudos) {
      return res.status(404).json({ success: false, message: 'Kudos not found' });
    }

    res.status(200).json({ success: true, data: kudos });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  giveKudos,
  getKudosFeed,
  toggleReaction,
  getKudosById
};
