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

## 6. Complete REST API Specifications & Reference

The backend API follows RESTful conventions and uses JSON payloads. It features secure **Pair-Token authentication** (`httpOnly` cookies with Bearer token fallback) and atomic MongoDB transaction safety.

### A. Authentication & Security Architecture

```
Client Request ──► [cookieParser / Bearer Header] ──► [authMiddleware (protect)]
  ├─ 15-Minute Access Token: Verified with JWT_ACCESS_SECRET
  └─ 7-Day Refresh Token: Stored in httpOnly cookie with token rotation on /api/auth/refresh
```

- **Base URL:** `http://localhost:5000/api`
- **Authentication:** Dual-mode:
  1. `httpOnly` secure cookies (automatic with browser `credentials: include`).
  2. `Authorization: Bearer <access_token>` header (for cURL / Postman testing).

---

### B. Endpoints Directory & Schema Details

#### 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth | Request Body / Query Params |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | Register new account and generate simulated verification email | Public | `{ "name": "...", "email": "...", "password": "...", "department": "Engineering" }` |
| `POST` | `/api/auth/verify-email` | Verify account via token and issue pair cookies | Public | `{ "token": "...", "email": "..." }` |
| `POST` | `/api/auth/login` | Authenticate with credentials, sets 15m + 7d cookies | Public | `{ "email": "...", "password": "..." }` |
| `POST` | `/api/auth/refresh` | Rotate tokens; revokes old refresh token and re-issues fresh pair | Cookie / Header | None (uses `refreshToken` cookie) |
| `POST` | `/api/auth/logout` | Invalidate refresh token in database and clear cookies | Protected | None |
| `GET`  | `/api/auth/me` | Retrieve authenticated user profile and wallet balances | Protected | None |
| `POST` | `/api/auth/forgot-password` | Generate simulated 1-hour cryptographic password reset link | Public | `{ "email": "..." }` |
| `POST` | `/api/auth/reset-password` | Reset password using cryptographic token | Public | `{ "token": "...", "newPassword": "..." }` |
| `GET`  | `/api/auth/simulated-inbox` | Inspect simulated outgoing emails & verification tokens | Public | None |

#### 2. Peer Kudos & Recognition Endpoints (`/api/kudos`)

| Method | Endpoint | Description | Auth | Request Body / Query Params |
|---|---|---|---|---|
| `POST` | `/api/kudos` | Send kudos with atomic point deduction & audit logging | Protected | `{ "receiverId": "...", "points": 20, "message": "...", "companyValue": "Innovation" }` |
| `GET`  | `/api/kudos` | Fetch paginated recognition stream | Optional | Query: `?page=1&limit=10&department=Engineering&value=Innovation&search=query` |
| `GET`  | `/api/kudos/:id` | Fetch a single kudos item with sender/receiver details | Optional | Param: `id` |
| `POST` | `/api/kudos/:id/react` | Toggle single emoji reaction (`+1`, `👏`, `🔥`, `❤️`, `🚀`) | Protected | `{ "emoji": "🔥" }` |

#### 3. User Directory & Profile Customization (`/api/users`)

| Method | Endpoint | Description | Auth | Request Body / Query Params |
|---|---|---|---|---|
| `GET`  | `/api/users` | List teammates for recognition autocomplete | Optional | Query: `?search=name&department=Design` |
| `GET`  | `/api/users/:id/profile` | View user profile, badges, and received/sent history | Optional | Param: `id` |
| `PUT`  | `/api/users/profile` | Update profile info, custom avatar, or local PC photo | Protected | `{ "name": "...", "department": "...", "avatar": "data:image/..." }` |

#### 4. Analytics & Leaderboard Endpoints (`/api/analytics`)

| Method | Endpoint | Description | Auth | Request Body / Query Params |
|---|---|---|---|---|
| `GET`  | `/api/analytics/leaderboard` | Monthly leaderboard via MongoDB aggregation pipeline | Optional | Query: `?month=current&department=ALL` |
| `GET`  | `/api/analytics/summary` | Organizational metrics, core values distribution | Optional | None |
| `POST` | `/api/analytics/reset-monthly-allowance` | Reset giving allowance back to 100 points for all users | Protected | None |

---

### C. Example cURL Commands for Evaluators

#### 1. Quick Login as Demo User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex.rivera@company.internal","password":"Password123!"}' \
  -c cookies.txt
```

#### 2. Send Kudos with Atomic Point Transfer
```bash
curl -X POST http://localhost:5000/api/kudos \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "receiverId": "65fc1234567890abcdef1234",
    "points": 20,
    "companyValue": "Innovation",
    "message": "Outstanding work spearheading the new design system primitives!"
  }'
```

#### 3. React to Kudos with Single Emoji Reaction
```bash
curl -X POST http://localhost:5000/api/kudos/65fc1234567890abcdef5678/react \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"emoji":"🔥"}'
```

#### 4. View Monthly Leaderboard via Aggregation Pipeline
```bash
curl -X GET "http://localhost:5000/api/analytics/leaderboard?department=Engineering"
```

---

## 7. Assumptions, Security Practices & Limitations

1. **Security & Cookies:** Tokens are stored in `httpOnly`, `SameSite: Lax` cookies, protecting them against script-based token harvesting (XSS). In production environments with HTTPS, `secure: true` and `SameSite: strict` are automatically activated.
2. **Transaction Safety:** MongoDB document operations use atomic conditional updates (`{ givingAllowance: { $gte: points } }`), eliminating race conditions where concurrent requests might overspend an employee's allowance.
3. **Simulated Email Service:** For evaluation portability, email verification and password resets are simulated locally via an in-memory queue accessible via the UI **Simulated Inbox** modal and terminal output, avoiding the need for external SMTP configurations (e.g. SendGrid/AWS SES).
4. **Monthly Reset:** In production, allowance resets run via a cron scheduler on the 1st of every month at midnight. For testing and demonstration purposes, a manual reset trigger is provided in the **Analytics** tab.

---

## 8. Video Presentation Guide

A complete recording script and step-by-step walkthrough is available in [VIDEO_WALKTHROUGH_SCRIPT.md](file:///d:/Projects/Drive/project3/VIDEO_WALKTHROUGH_SCRIPT.md) to help record the submission video with maximum confidence.
