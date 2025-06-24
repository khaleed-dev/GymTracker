# HK GymTracker

A simple, modern gym attendance tracker for small groups of friends. Log your daily gym sessions, see everyone's progress on a shared calendar, and stay motivated together!

---

## Features
- 📅 **Shared Calendar:** See all users' check-ins in a clean, mobile-friendly calendar view.
- 💪 **One-Click Check-In:** Log your gym session for today with a single button.
- ⏰ **Workout Time:** Optionally record the time of your workout.
- 🔄 **Undo Check-In:** Made a mistake? Instantly undo your check-in.
- 👥 **Multi-User:** Each user has their own account and check-ins.
- 🔒 **Authentication:** Secure sign-up and sign-in with email/username and password.
- 🛡️ **Admin Panel:** Admins can manage users and reset passwords.
- 🟢 **Live Updates:** Calendar updates instantly after check-in/out.

---

## Tech Stack
- **Next.js** (App Router, React, TypeScript)
- **Prisma** ORM
- **SQLite** (local DB, easy to migrate to Postgres/MySQL)
- **NextAuth.js** (authentication)
- **Tailwind CSS** (UI)

---

## Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/hk-gymtracker.git
   cd hk-gymtracker
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up your environment variables:**
   - Copy `.env.example` to `.env` and fill in the values (see below).
4. **Run the app locally:**
   ```bash
   npm run dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## Environment Variables
Create a `.env` file with at least:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=your-random-secret
```

---

## Deployment
- **Recommended:** [Railway](https://railway.app) (free, persistent SQLite, custom domain support)
- Also works on [Render](https://render.com), [Fly.io], or your own VPS.
- For production, consider using Postgres or MySQL for the database.

---

## License
MIT

---

## Credits
Built with ❤️ by @khaleed-dev.