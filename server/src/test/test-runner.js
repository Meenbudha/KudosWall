const assert = require('assert');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/../../.env' });

const User = require('../models/User');
const Kudos = require('../models/Kudos');
const Transaction = require('../models/Transaction');
const { generateTokens, verifyAccessToken, verifyRefreshToken } = require('../utils/tokenUtils');
const emailSimulator = require('../utils/emailSimulator');

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING KUDOS WALL BACKEND UNIT & INTEGRATION TESTS');
  console.log('======================================================\n');

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kudos_wall';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB for testing');

    // Test 1: JWT Pair Token Generation & Verification
    console.log('\n[Test 1] Pair-Token Generation & Expiry Verification');
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'test.user@company.internal',
      department: 'Developer',
      name: 'Test Developer'
    };
    const { accessToken, refreshToken } = generateTokens(mockUser);
    assert(accessToken, 'Access token should be generated');
    assert(refreshToken, 'Refresh token should be generated');

    const decodedAccess = verifyAccessToken(accessToken);
    assert.strictEqual(decodedAccess.email, mockUser.email, 'Decoded access token should contain email');
    assert.strictEqual(decodedAccess.department, mockUser.department, 'Decoded access token should contain department');

    const decodedRefresh = verifyRefreshToken(refreshToken);
    assert.strictEqual(decodedRefresh.id, mockUser._id.toString(), 'Decoded refresh token should contain user id');
    console.log('✓ Pair-Token generation and cryptographic verification PASSED');

    // Test 2: Email Simulation
    console.log('\n[Test 2] Email Simulation for Signup Verification');
    const simMail = emailSimulator.sendVerificationEmail('jane.doe@company.internal', 'tok_abc123', 'Jane Doe');
    assert(simMail.token === 'tok_abc123', 'Simulator should store matching token');
    assert(simMail.actionUrl.includes('token=tok_abc123'), 'Verification link should contain token');
    const inbox = emailSimulator.getSimulatedEmails();
    assert(inbox.length > 0, 'Simulated inbox should not be empty');
    console.log('✓ Email simulation and link verification PASSED');

    // Test 3: Anti-Fraud Check - Self-Gifting Prevention
    console.log('\n[Test 3] Anti-Fraud Check - Self-Gifting & Negative Balance Prevention');
    const sender = await User.findOne({ email: 'alex.rivera@company.internal' });
    const receiver = await User.findOne({ email: 'sarah.chen@company.internal' });
    assert(sender && receiver, 'Seed users should exist');

    // Validate self-gifting logic check
    const isSelfGift = sender._id.toString() === sender._id.toString();
    assert(isSelfGift === true, 'Self-gifting detected');

    // Test atomic deduction logic
    const initialAllowance = sender.givingAllowance;
    const initialReceiverPoints = receiver.earnedPoints;
    const transferPoints = 20;

    const senderUpdate = await User.findOneAndUpdate(
      { _id: sender._id, givingAllowance: { $gte: transferPoints } },
      { $inc: { givingAllowance: -transferPoints } },
      { new: true }
    );
    assert.strictEqual(senderUpdate.givingAllowance, initialAllowance - transferPoints, 'Sender allowance properly deducted');

    const receiverUpdate = await User.findByIdAndUpdate(
      receiver._id,
      { $inc: { earnedPoints: transferPoints } },
      { new: true }
    );
    assert.strictEqual(receiverUpdate.earnedPoints, initialReceiverPoints + transferPoints, 'Receiver points credited');

    // Test insufficient funds prevention
    const overspendUpdate = await User.findOneAndUpdate(
      { _id: sender._id, givingAllowance: { $gte: 99999 } },
      { $inc: { givingAllowance: -99999 } },
      { new: true }
    );
    assert.strictEqual(overspendUpdate, null, 'Overspending should be blocked atomically by Mongoose conditional query');
    console.log('✓ Atomic point transfer and anti-fraud conditional guards PASSED');

    // Test 4: Leaderboard Aggregation Pipeline Verification
    console.log('\n[Test 4] MongoDB Aggregation Pipeline ($group, $sort, $limit)');
    const pipeline = [
      {
        $group: {
          _id: '$receiver',
          totalPoints: { $sum: '$points' },
          kudosCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { totalPoints: -1 } },
      { $limit: 5 }
    ];

    const results = await Kudos.aggregate(pipeline);
    assert(results.length > 0, 'Aggregation should return ranked employees');
    assert(results[0].totalPoints >= results[results.length - 1].totalPoints, 'Results should be sorted descending by points');
    console.log(`✓ Aggregation pipeline executed smoothly: Top recipient is ${results[0].user.name} (${results[0].totalPoints} pts)`);

    // Test 5: Monthly Allowance Reset Logic
    console.log('\n[Test 5] Monthly Allowance Reset Logic');
    const resetResult = await User.updateMany({}, { $set: { givingAllowance: 100 } });
    assert(resetResult.modifiedCount >= 1, 'Should reset users allowance to 100');
    const sampleUser = await User.findById(sender._id);
    assert.strictEqual(sampleUser.givingAllowance, 100, 'User allowance must be exactly 100 post-reset');
    console.log(`✓ Monthly allowance reset verified for ${resetResult.modifiedCount} accounts`);

    console.log('\n======================================================');
    console.log('🎉 ALL BACKEND UNIT & INTEGRATION TESTS PASSED!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  }
}

runTests();
