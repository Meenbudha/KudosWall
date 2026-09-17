const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const kudosRoutes = require('./routes/kudosRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect Database
connectDB();

// Middlewares
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logger for visibility
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[API] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Internal Team Feedback & Peer Kudos Wall API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Interactive API Documentation endpoint
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    service: 'KudosWall API Documentation',
    baseUrl: `http://localhost:${PORT}/api`,
    endpoints: [
      {
        category: 'Authentication & Security',
        items: [
          { method: 'POST', path: '/auth/signup', description: 'Register new user and triggers simulated verification email', body: ['name', 'email', 'password', 'department'] },
          { method: 'POST', path: '/auth/verify-email', description: 'Verify account token and log in with httpOnly cookies', body: ['token', 'email'] },
          { method: 'POST', path: '/auth/login', description: 'Login, issues 15m access token + 7d refresh token in secure cookies', body: ['email', 'password'] },
          { method: 'POST', path: '/auth/refresh', description: 'Rotate tokens: verifies old refresh token, replaces with new pair in cookies' },
          { method: 'POST', path: '/auth/logout', description: 'Clears auth cookies and revokes session in DB' },
          { method: 'POST', path: '/auth/forgot-password', description: 'Triggers simulated password reset email', body: ['email'] },
          { method: 'POST', path: '/auth/reset-password', description: 'Resets password using cryptographic token', body: ['token', 'newPassword'] },
          { method: 'GET',  path: '/auth/me', description: 'Get current logged-in user profile & balances' },
          { method: 'GET',  path: '/auth/simulated-inbox', description: 'View simulated emails (verification links & reset tokens)' }
        ]
      },
      {
        category: 'Peer Kudos & Point Transactions',
        items: [
          { method: 'POST', path: '/kudos', description: 'Send Kudos: atomic point deduction from sender, credit to receiver, anti-fraud check', body: ['receiverId', 'points (10, 20, 50)', 'message', 'companyValue'] },
          { method: 'GET',  path: '/kudos', description: 'Get social feed with pagination and filters', query: ['page', 'limit', 'companyValue', 'department', 'search'] },
          { method: 'POST', path: '/kudos/:id/react', description: 'Toggle emoji reaction (+1, 👏, 🔥, ❤️, 🚀) with optimistic update', body: ['emoji'] },
          { method: 'GET',  path: '/kudos/:id', description: 'Get single kudos details' }
        ]
      },
      {
        category: 'Leaderboards & Aggregated Analytics',
        items: [
          { method: 'GET',  path: '/analytics/leaderboard', description: 'MongoDB Aggregation Pipeline ($group, $sort, $limit) ranking top-recognized peers', query: ['department', 'timeframe'] },
          { method: 'GET',  path: '/analytics/summary', description: 'Company values distribution and department points totals' },
          { method: 'POST', path: '/analytics/reset-monthly-allowance', description: 'Refreshes giving allowance to 100 points for all team members' }
        ]
      },
      {
        category: 'Team Directory & Profiles',
        items: [
          { method: 'GET',  path: '/users', description: 'User autocomplete directory for giving kudos', query: ['search', 'department'] },
          { method: 'GET',  path: '/users/:id/profile', description: 'User profile with received vs. sent kudos history and recognition badges' },
          { method: 'PUT',  path: '/users/profile', description: 'Update current user profile info', body: ['name', 'department', 'avatar'] }
        ]
      }
    ]
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/kudos', kudosRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 KudosWall Backend API Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📖 Interactive API Docs: http://localhost:${PORT}/api/docs`);
  console.log(`======================================================\n`);
});

module.exports = app;
