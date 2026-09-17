# Project Explanation Video Script & Walkthrough Guide
> **Internal Team Feedback & Peer Kudos Wall (Bonusly / Matter Alternative)**  
> *Use this script as a speaking outline when recording your video submission for the hiring evaluation team.*

---

## 🕒 Suggested Video Duration: 5–8 Minutes

### Segment 1: Introduction & Problem Statement (0:00 – 1:00)
- **Greeting:** *"Hello everyone, my name is [Your Name]. Today I am presenting my technical assessment submission: **KudosWall**, an internal peer recognition and feedback platform inspired by Bonusly and Matter."*
- **Problem Statement:** *"In fast-moving product and engineering organizations, peer contributions often go uncelebrated. KudosWall solves this by empowering team members with a monthly allowance of points (100 points per month) to recognize peers living core company values—complete with a live social recognition feed, optimistic reactions, and real-time department leaderboards."*

---

### Segment 2: Tech Stack & Architectural Decisions (1:00 – 2:30)
- **Technology Stack:**
  - **Backend:** Node.js & Express.js for clean modular REST APIs.
  - **Database:** MongoDB & Mongoose for schema modeling, embedded reactions, and complex aggregation pipelines.
  - **Frontend:** React 18, Vite, Lucide Icons, and Canvas Confetti.
  - **Design Standard:** Built adhering to Coss.com/ui design primitives with a dark-mode slate theme, glassmorphism, and responsive layouts.
- **Universal Security & Auth Architecture:**
  - *"For security, I implemented **pair-token authentication**: a short-lived **15-minute Access Token** and a long-lived **7-day Refresh Token** stored in secure `httpOnly` cookies to protect against XSS attacks."*
  - *"I also built **token rotation** with token reuse detection—each time a token is refreshed, the old refresh token is invalidated and a new cryptographic pair is issued."*
  - *"For the evaluation, I built an interactive **Simulated Email Inbox** so signup verification tokens and password reset flows can be tested seamlessly without third-party email configuration."*

---

### Segment 3: Live Application Demonstration (2:30 – 5:30)

#### 1. Landing on the Recognition Wall
- Show the feed with rich kudos cards (sender, receiver, points badge, company value tag, timestamp).
- Click on emoji reactions (`+1`, `👏`, `🔥`, `❤️`, `🚀`) and explain the **optimistic UI updates**: the counter increments immediately while synchronizing with the backend in the background.

#### 2. Authentication & 1-Click Quick Login
- Click **Sign In**. Point out the **1-Click Evaluator Quick-Login** (e.g. Alex Rivera).
- Note how the navbar immediately reflects:
  - Monthly Giving Allowance: `60 pts to give`
  - Earned Points Wallet: `190 pts earned`

#### 3. Sending Kudos & Atomic Point Transactions
- Click **Give Kudos** to open the modal.
- Highlight the **anti-fraud safeguards**:
  - The teammate autocomplete list strictly filters out the sender (no self-gifting allowed).
  - Point selector buttons (`+10`, `+20`, `+50`) dynamically prevent overspending beyond the available allowance.
  - Select recipient (e.g. Priya Patel), select `+20 pts`, pick `#Teamwork`, write a message, and submit.
  - Show the confetti animation, note that the new card appears at the top of the feed, and the sender's allowance decrements by 20.
  - Explain the backend atomic transaction: *"We use conditional atomic updates `{ _id: senderId, givingAllowance: { $gte: points } }` so concurrent requests can never result in a negative balance."*

#### 4. Monthly Leaderboard & Aggregation Pipelines
- Click the **Leaderboard** tab.
- Show the **Top 3 Podium** (🥇, 🥈, 🥉) and the ranked table.
- Explain the backend logic: *"This is powered by a MongoDB aggregation pipeline using `$match`, `$group`, `$lookup`, `$unwind`, and `$sort`, dynamically filtering by department and month."*
- Demonstrate department filtering (e.g. click 'Design' or 'Engineering').

#### 5. Analytics & Monthly Reset Simulator
- Click the **Analytics** tab.
- Show the **Core Values Distribution** progress bars and department breakdown.
- Demonstrate the **Monthly Allowance Reset Engine**: Click *"Simulate Monthly Reset"*, show the confirmation and toast, and show that giving allowances refresh to 100 points.

#### 6. User Profile & Badges
- Click the profile icon to open **My Profile & Badges**.
- Show the two separate wallets: *Giving Allowance* vs *Cumulative Earned Points*.
- Show the **Badges Grid** (*Culture Starter*, *Century Champion*, etc.) and the history tabs (*Received* vs *Sent*).

#### 7. Interactive API Docs
- Click the **API Docs** button in the header to demonstrate the built-in documentation with endpoints, payloads, and parameter details.

---

### Segment 4: Challenges & Problem Solving (5:30 – 6:45)
- **Challenge 1: Concurrency & Balance Integrity:**
  - *"A key challenge in point-wallet systems is race conditions where a user sends multiple requests simultaneously. I solved this by leveraging MongoDB's atomic conditional updates (`{ givingAllowance: { $gte: points } }`) and an audit ledger in the Transaction collection, ensuring points cannot be spent if the balance is insufficient."*
- **Challenge 2: Secure Pair-Token Auth in httpOnly Cookies with SPA Interceptors:**
  - *"Handling silent token refresh with Axios interceptors required queueing parallel requests while the refresh call was pending to prevent duplicate refreshes or logout loops."*

---

### Segment 5: Conclusion & Future Enhancements (6:45 – End)
- *"With more time, I would expand this with Slack/Teams webhook notifications and redeemable company rewards catalog."*
- *"All source code, setup instructions, seed data, and API documentation are committed to the public Git repository."*
- *"Thank you for your time and for reviewing my assessment!"*
