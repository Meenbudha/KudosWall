const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../src/models/User');
const Kudos = require('../src/models/Kudos');
const Transaction = require('../src/models/Transaction');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kudos_wall';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB at ${mongoUri}`);

    // Clean existing collections
    console.log('[Seed] Cleaning old records...');
    await User.deleteMany({});
    await Kudos.deleteMany({});
    await Transaction.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const commonHashedPassword = await bcrypt.hash('Password123!', salt);

    const initialUsers = [
      {
        name: 'Alex Rivera',
        email: 'alex.rivera@company.internal',
        password: commonHashedPassword,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        department: 'Engineering',
        givingAllowance: 60,
        earnedPoints: 190,
        isVerified: true,
        badges: [
          { id: 'first_kudos', name: 'Culture Starter', icon: '🌱', description: 'Sent your very first peer kudos!', earnedAt: new Date() },
          { id: 'century_club', name: 'Century Champion', icon: '🏆', description: 'Crossed 100+ earned points!', earnedAt: new Date() },
          { id: 'team_pillar', name: 'Team Pillar', icon: '🏛️', description: 'Received recognition from 3+ distinct colleagues.', earnedAt: new Date() }
        ]
      },
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@company.internal',
        password: commonHashedPassword,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        department: 'Design',
        givingAllowance: 40,
        earnedPoints: 240,
        isVerified: true,
        badges: [
          { id: 'first_kudos', name: 'Culture Starter', icon: '🌱', description: 'Sent your very first peer kudos!', earnedAt: new Date() },
          { id: 'rising_star', name: 'Rising Star', icon: '⭐', description: 'Earned 50+ points from teammates.', earnedAt: new Date() },
          { id: 'century_club', name: 'Century Champion', icon: '🏆', description: 'Crossed 100+ earned points!', earnedAt: new Date() }
        ]
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@company.internal',
        password: commonHashedPassword,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        department: 'Engineering',
        givingAllowance: 80,
        earnedPoints: 130,
        isVerified: true,
        badges: [
          { id: 'rising_star', name: 'Rising Star', icon: '⭐', description: 'Earned 50+ points from teammates.', earnedAt: new Date() }
        ]
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@company.internal',
        password: commonHashedPassword,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        department: 'Product',
        givingAllowance: 50,
        earnedPoints: 170,
        isVerified: true,
        badges: [
          { id: 'century_club', name: 'Century Champion', icon: '🏆', description: 'Crossed 100+ earned points!', earnedAt: new Date() }
        ]
      },
      {
        name: 'David Kim',
        email: 'david.kim@company.internal',
        password: commonHashedPassword,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        department: 'Marketing',
        givingAllowance: 70,
        earnedPoints: 90,
        isVerified: true,
        badges: [
          { id: 'rising_star', name: 'Rising Star', icon: '⭐', description: 'Earned 50+ points from teammates.', earnedAt: new Date() }
        ]
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@company.internal',
        password: commonHashedPassword,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        department: 'Sales',
        givingAllowance: 30,
        earnedPoints: 150,
        isVerified: true,
        badges: [
          { id: 'generous_heart', name: 'Generous Heart', icon: '💖', description: 'Recognized peers 5 or more times.', earnedAt: new Date() },
          { id: 'century_club', name: 'Century Champion', icon: '🏆', description: 'Crossed 100+ earned points!', earnedAt: new Date() }
        ]
      },
      {
        name: 'Jordan Hayes',
        email: 'jordan.hayes@company.internal',
        password: commonHashedPassword,
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        department: 'HR',
        givingAllowance: 90,
        earnedPoints: 60,
        isVerified: true,
        badges: [
          { id: 'first_kudos', name: 'Culture Starter', icon: '🌱', description: 'Sent your very first peer kudos!', earnedAt: new Date() }
        ]
      }
    ];

    const createdUsers = await User.insertMany(initialUsers);
    console.log(`[Seed] Created ${createdUsers.length} users.`);

    const userMap = {};
    createdUsers.forEach(u => {
      userMap[u.name] = u;
    });

    console.log('[Seed] Generating sample kudos feed and point transactions...');

    const sampleKudos = [
      {
        sender: userMap['Alex Rivera']._id,
        receiver: userMap['Sarah Chen']._id,
        points: 50,
        message: 'Huge thanks Sarah for spearheading the new design system primitives! The tokens and accessibility polish made building our new dashboards 10x faster. 🎨✨',
        companyValue: '#Innovation',
        createdAt: new Date(Date.now() - 1000 * 60 * 35), // 35 mins ago
        reactions: [
          { emoji: '+1', users: [userMap['Marcus Vance']._id, userMap['David Kim']._id] },
          { emoji: '👏', users: [userMap['Elena Rostova']._id] },
          { emoji: '🔥', users: [userMap['Priya Patel']._id, userMap['Jordan Hayes']._id] },
          { emoji: '❤️', users: [userMap['Alex Rivera']._id] },
          { emoji: '🚀', users: [userMap['Sarah Chen']._id] }
        ]
      },
      {
        sender: userMap['Sarah Chen']._id,
        receiver: userMap['Alex Rivera']._id,
        points: 50,
        message: 'Massive shoutout to Alex for helping debug the nasty memory leak in the data pipeline on Friday night before release. True engineering ownership! 💻⚡',
        companyValue: '#Teamwork',
        createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hrs ago
        reactions: [
          { emoji: '+1', users: [userMap['Sarah Chen']._id] },
          { emoji: '👏', users: [userMap['Marcus Vance']._id, userMap['David Kim']._id] },
          { emoji: '🔥', users: [userMap['Elena Rostova']._id] },
          { emoji: '❤️', users: [] },
          { emoji: '🚀', users: [userMap['Priya Patel']._id] }
        ]
      },
      {
        sender: userMap['Priya Patel']._id,
        receiver: userMap['Elena Rostova']._id,
        points: 50,
        message: 'Elena, the product discovery sessions you ran with our enterprise tier customers directly unblocked the biggest contract closing of this quarter! 🚀🤝',
        companyValue: '#CustomerObsession',
        createdAt: new Date(Date.now() - 1000 * 60 * 360), // 6 hrs ago
        reactions: [
          { emoji: '+1', users: [userMap['David Kim']._id] },
          { emoji: '👏', users: [userMap['Alex Rivera']._id, userMap['Sarah Chen']._id] },
          { emoji: '🔥', users: [userMap['Priya Patel']._id] },
          { emoji: '❤️', users: [userMap['Jordan Hayes']._id] },
          { emoji: '🚀', users: [userMap['Marcus Vance']._id] }
        ]
      },
      {
        sender: userMap['Elena Rostova']._id,
        receiver: userMap['Marcus Vance']._id,
        points: 20,
        message: 'Thanks Marcus for turning around the telemetry dashboards in under 24 hours so we could monitor the A/B experiment live! 🙌',
        companyValue: '#BiasForAction',
        createdAt: new Date(Date.now() - 1000 * 60 * 720), // 12 hrs ago
        reactions: [
          { emoji: '+1', users: [userMap['Alex Rivera']._id] },
          { emoji: '👏', users: [userMap['Elena Rostova']._id] },
          { emoji: '🔥', users: [] },
          { emoji: '❤️', users: [userMap['Sarah Chen']._id] },
          { emoji: '🚀', users: [] }
        ]
      },
      {
        sender: userMap['David Kim']._id,
        receiver: userMap['Sarah Chen']._id,
        points: 20,
        message: 'The visual assets Sarah created for our spring product launch drove a 38% bump in landing page conversions! Outstanding work. 📈🎉',
        companyValue: '#CustomerObsession',
        createdAt: new Date(Date.now() - 1000 * 60 * 1440), // 1 day ago
        reactions: [
          { emoji: '+1', users: [userMap['Priya Patel']._id] },
          { emoji: '👏', users: [userMap['David Kim']._id] },
          { emoji: '🔥', users: [userMap['Alex Rivera']._id] },
          { emoji: '❤️', users: [] },
          { emoji: '🚀', users: [] }
        ]
      },
      {
        sender: userMap['Jordan Hayes']._id,
        receiver: userMap['Priya Patel']._id,
        points: 10,
        message: 'Priya mentored two of our new sales development reps this week and got them fully ramped ahead of schedule. Thank you for your leadership! 🌟',
        companyValue: '#Leadership',
        createdAt: new Date(Date.now() - 1000 * 60 * 2880), // 2 days ago
        reactions: [
          { emoji: '+1', users: [userMap['Elena Rostova']._id] },
          { emoji: '👏', users: [userMap['Jordan Hayes']._id, userMap['Sarah Chen']._id] },
          { emoji: '🔥', users: [] },
          { emoji: '❤️', users: [userMap['Priya Patel']._id] },
          { emoji: '🚀', users: [] }
        ]
      },
      {
        sender: userMap['Marcus Vance']._id,
        receiver: userMap['Alex Rivera']._id,
        points: 20,
        message: 'Alex introduced smart query caching on our MongoDB aggregations which dropped our response latencies from 420ms down to 18ms! Outstanding engineering! 🏎️💨',
        companyValue: '#Innovation',
        createdAt: new Date(Date.now() - 1000 * 60 * 4320), // 3 days ago
        reactions: [
          { emoji: '+1', users: [userMap['Sarah Chen']._id] },
          { emoji: '👏', users: [userMap['Marcus Vance']._id] },
          { emoji: '🔥', users: [userMap['David Kim']._id] },
          { emoji: '❤️', users: [] },
          { emoji: '🚀', users: [userMap['Alex Rivera']._id] }
        ]
      }
    ];

    const createdKudos = await Kudos.insertMany(sampleKudos);
    console.log(`[Seed] Created ${createdKudos.length} kudos cards.`);

    // Create corresponding transaction records
    const txRecords = createdKudos.map(k => ({
      type: 'KUDOS_GIFT',
      sender: k.sender,
      receiver: k.receiver,
      points: k.points,
      kudosId: k._id,
      notes: `Kudos given under ${k.companyValue}`
    }));

    await Transaction.insertMany(txRecords);
    console.log(`[Seed] Created ${txRecords.length} transaction audit log entries.`);

    console.log('\n=============================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('-------------------------------------------------------------');
    console.log('Demo Accounts ready to log in (Password for all: Password123!):');
    createdUsers.forEach(u => {
      console.log(`- ${u.name.padEnd(16)} | ${u.email.padEnd(30)} | ${u.department.padEnd(12)} | Allowance: ${u.givingAllowance} pts | Earned: ${u.earnedPoints} pts`);
    });
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
