# KudosWall • Internal Team Feedback & Peer Recognition Platform
> **A high-performance peer recognition and kudos system inspired by Bonusly and Matter.**  
> Built for modern engineering and product cultures with pair-token JWT security, atomic point transaction safety, live leaderboards powered by MongoDB aggregation pipelines, and a polished Coss UI design system.

---

## 1. Project Overview & Architecture

**KudosWall** enables team members to celebrate peers alongside core company values (`#Teamwork`, `#CustomerObsession`, `#Innovation`, `#Leadership`, `#BiasForAction`). Team members receive a monthly allowance of **100 points** to distribute to colleagues, while earned recognition points accumulate permanently in their recognition wallets.

### Architectural Diagram

```
                                  ┌───────────────────────────────┐
                                  │      Client: React 18         │
                                  │    Coss UI Design System      │
                                  │   (Vite + Lucide + Confetti)  │
                                  └───────────────┬───────────────┘
                                                  │
                               HTTP / REST (withCredentials: true)
                               Secure httpOnly JWT Cookies (15m + 7d)
                                                  │
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │      Express.js Backend       │
                                  │     Node.js Architecture      │
                                  └───────┬───────┬───────┬───────┘
                                          │       │       │
                  ┌───────────────────────┘       │       └────────────────────────┐
                  ▼                               ▼                                ▼
       ┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
       │   Auth & Security    │        │ Point Transactions   │        │ Analytics & Reset    │
       │  - Pair-Token JWT    │        │  - Atomic Balance    │        │  - Mongo Aggregation │
       │  - Token Rotation    │        │  - Anti-Fraud Guards │        │    ($group, $sort)   │
       │  - Simulated Email   │        │  - Audit Ledger      │        │  - Monthly Cron      │
       └──────────┬───────────┘        └──────────┬───────────┘        └──────────┬───────────┘
                  │                               │                               │
                  └───────────────────────┬───────┴───────────────────────────────┘
                                          ▼
                               ┌──────────────────────┐
                               │  MongoDB Database    │
                               │  - Users & Badges    │
                               │  - Kudos & Reactions │
                               │  - Transaction Logs  │
                               └──────────────────────┘
```

---

## 2. Technology Stack & Technical Decisions

| Layer | Technologies Used | Key Decisions & Rationale |
|---|---|---|
| **Frontend** | React 18, Vite, Lucide Icons, Canvas Confetti | Fast compilation, modular components, optimistic UI reaction updates, zero external CSS bloat. |
| **Styling** | Custom Vanilla CSS (Coss.com/ui Primitives) | Clean dark-mode aesthetic, accessible dialog modals, pill selectors, glowing indicators, responsive design. |
| **Backend API** | Node.js, Express.js | High-throughput asynchronous I/O, modular controller-service-route architecture, centralized error handling. |
| **Database** | MongoDB, Mongoose ODM | Flexible document model for embedded emoji reactions and badge arrays; powerful aggregation framework for leaderboards. |
| **Security & Auth** | JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser` | Short-lived 15m Access Token + 7d Refresh Token stored in `httpOnly`, `SameSite` cookies with refresh token rotation and reuse detection. |

---

## 3. Key Feature Specifications Implemented

### A. Universal Security & Pair Token Authentication
- **Pair Token Auth:** 15-minute Access Token + 7-day Refresh Token stored exclusively in `httpOnly` secure cookies to prevent XSS credential theft.
- **Refresh Token Rotation:** On calling `/api/auth/refresh`, the old refresh token is invalidated and a new cryptographic pair is issued. Token reuse is actively detected, revoking compromised sessions.
- **Simulated Verification Flow:** User registration simulates email verification with tokens and direct-action links accessible via the built-in **Simulated Inbox**.
- **Password Reset:** Cryptographic token generation (`crypto.randomBytes`) with 1-hour expiration and SHA-256 hashing in the database.

### B. "Give Kudos" Workflow & Point Transactions
- **Recipient Autocomplete:** Real-time search by teammate name and department, strictly excluding self to prevent self-gifting.
- **Preset & Custom Points:** Quick buttons for `+10`, `+20`, `+50` points with real-time balance comparison.
- **Company Value Tags:** `#Teamwork`, `#CustomerObsession`, `#Innovation`, `#Leadership`, `#BiasForAction`.
- **Atomic Point Deductions & Anti-Fraud:**
  - Strict conditional update: `{ _id: senderId, givingAllowance: { $gte: points } }` ensures sender cannot overspend.
  - Verification that sender $\ne$ receiver (no self-tipping).
  - Atomic increment to receiver's `earnedPoints` with automatic compensation rollback if sub-operations fail.
  - Complete audit trail logged in `Transaction` collection.
  - Confetti particle celebration on success!

### C. Social Recognition Wall & Feed
- **Rich Kudos Cards:** Displaying sender & receiver avatars, department badges, point chips, company value tags, and relative timestamps.
- **Optimistic Emoji Reactions:** Five interactive reactions (`+1`, `👏`, `🔥`, `❤️`, `🚀`) with instant visual updates, user reaction state highlighting, and background synchronization.
- **Filters & Search:** Filter by company value tag, department, or keyword search.
- **Infinite Pagination:** Smooth pagination support with "Load More" controls.

### D. Aggregated Leaderboards & Department Analytics
- **MongoDB Aggregation Pipelines:** Utilizing `$match`, `$group`, `$lookup`, `$unwind`, `$project`, and `$sort` to dynamically rank top-recognized colleagues this month.
- **Top 3 Podium:** Visual 🥇 Gold, 🥈 Silver, and 🥉 Bronze podium highlighting top culture champions.
- **Monthly Allowance Reset Engine:** Logic to refresh all team members' `givingAllowance` back to 100 points, with a demo simulation trigger in the Analytics tab.
- **Company Values Distribution:** Real-time percentage breakdowns of which values are most frequently demonstrated.

### E. User Profiles & Recognition Wallets
- Separate tracking of **Monthly Giving Allowance** (resets monthly) and **Cumulative Earned Points** (permanent).
- **History Tabs:** Clear breakdown of *Received Kudos* vs. *Sent Kudos*.
- **Dynamic Recognition Badges:** Milestones automatically unlocked (e.g., *Culture Starter* 🌱, *Rising Star* ⭐, *Century Champion* 🏆, *Team Pillar* 🏛️, *Generous Heart* 💖).

---

## 4. Prerequisites & Environment Setup

- **Node.js**: `v18+` (Tested on Node `v24.12.0`)
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

### Environment Configuration

The backend contains a `.env` file (`server/.env`). An example configuration is provided in `server/.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/kudos_wall
JWT_ACCESS_SECRET=kudos_super_secret_access_jwt_key_2026_x9123
JWT_REFRESH_SECRET=kudos_super_secret_refresh_jwt_key_2026_y9841
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 5. Quick Start Instructions

### Step 1: Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Seed the Database
Populate realistic demo users, departments, allowances, kudos, and reactions:
```bash
cd server
npm run seed
```

**Pre-seeded Demo Accounts (Password for all: `Password123!`):**
- **Alex Rivera** (`alex.rivera@company.internal`) — Engineering (Allowance: 60 pts, Earned: 190 pts)
- **Sarah Chen** (`sarah.chen@company.internal`) — Design (Allowance: 40 pts, Earned: 240 pts)
- **Marcus Vance** (`marcus.vance@company.internal`) — Engineering (Allowance: 80 pts, Earned: 130 pts)
- **Elena Rostova** (`elena.rostova@company.internal`) — Product (Allowance: 50 pts, Earned: 170 pts)
- **David Kim** (`david.kim@company.internal`) — Marketing (Allowance: 70 pts, Earned: 90 pts)
- **Priya Patel** (`priya.patel@company.internal`) — Sales (Allowance: 30 pts, Earned: 150 pts)
- **Jordan Hayes** (`jordan.hayes@company.internal`) — HR (Allowance: 90 pts, Earned: 60 pts)

> 💡 *Tip: You can also use the 1-Click Evaluator Quick-Login button directly in the Sign In modal without typing!*

### Step 3: Run Automated Tests
```bash
cd server
npm test
```
*Validates token pair generation, anti-fraud self-gifting rejection, atomic deduction, MongoDB aggregation pipelines, and monthly allowance reset.*

### Step 4: Launch the Application
Start backend and frontend servers:

```bash
# Terminal 1: Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd client
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 6. Interactive API Documentation

You can view the interactive API documentation directly within the running web app by clicking the **"API Docs"** button in the top navigation bar, or via `http://localhost:5000/api/docs`.

### Primary Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Create user and trigger simulated email verification | No |
| `POST` | `/api/auth/verify-email` | Validate token and set pair auth cookies | No |
| `POST` | `/api/auth/login` | Log in and receive 15m access + 7d refresh token cookies | No |
| `POST` | `/api/auth/refresh` | Rotate tokens and reissue fresh cookie pair | Cookie |
| `POST` | `/api/auth/logout` | Clear auth cookies and revoke refresh token in DB | Cookie |
| `GET`  | `/api/auth/me` | Fetch authenticated user details and balance | Cookie |
| `GET`  | `/api/auth/simulated-inbox`| View simulated verification & reset emails | No |
| `POST` | `/api/kudos` | Send peer kudos (atomic deduction & credit) | Cookie |
| `GET`  | `/api/kudos` | Retrieve paginated social feed with filters | Optional |
| `POST` | `/api/kudos/:id/react` | Toggle emoji reaction (+1, 👏, 🔥, ❤️, 🚀) | Cookie |
| `GET`  | `/api/analytics/leaderboard`| Aggregation pipeline ranking top peers of month | Optional |
| `GET`  | `/api/analytics/summary` | Distribution of company values and department metrics | Optional |
| `POST` | `/api/analytics/reset-monthly-allowance` | Reset all users' giving allowance to 100 pts | Cookie |
| `GET`  | `/api/users` | User autocomplete directory | Optional |
| `GET`  | `/api/users/:id/profile`| User profile with badges & received/sent history | Optional |

---

## 7. Assumptions, Security Practices & Limitations

1. **Security & Cookies:** Tokens are stored in `httpOnly`, `SameSite: Lax` cookies, protecting them against script-based token harvesting (XSS). In production environments with HTTPS, `secure: true` and `SameSite: strict` are automatically activated.
2. **Transaction Safety:** MongoDB document operations use atomic conditional updates (`{ givingAllowance: { $gte: points } }`), eliminating race conditions where concurrent requests might overspend an employee's allowance.
3. **Simulated Email Service:** For evaluation portability, email verification and password resets are simulated locally via an in-memory queue accessible via the UI **Simulated Inbox** modal and terminal output, avoiding the need for external SMTP configurations (e.g. SendGrid/AWS SES).
4. **Monthly Reset:** In production, allowance resets run via a cron scheduler on the 1st of every month at midnight. For testing and demonstration purposes, a manual reset trigger is provided in the **Analytics** tab.

---

## 8. Video Presentation Guide

A complete recording script and step-by-step walkthrough is available in [VIDEO_WALKTHROUGH_SCRIPT.md](file:///d:/Projects/Drive/project3/VIDEO_WALKTHROUGH_SCRIPT.md) to help record the submission video with maximum confidence.
