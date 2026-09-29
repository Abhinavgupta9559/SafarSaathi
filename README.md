# 🚕 SafarSaathi — AI-Powered Local Transport Assistant

> *"Tell us where you are and where you want to go — we'll tell you which transport to take, where to find it, how much it costs, and how to combine it."*

Google Maps tells you the **route**. SafarSaathi tells you the **transport**: first-mile (which auto / e-rickshaw, from which pickup point) → main transport (metro / bus) → last-mile — with fare and time estimates. Built for people who are new to a city.

## ✨ Features
- **Transport-first journey planner** — first-mile + main transport + last-mile, with fare & time
- **AI assistant** — ask in natural Hindi/English/Hinglish ("₹200 hain, Noida se India Gate jana hai"); powered by Claude with automatic rule-based fallback if no API key is set
- **Voice input 🎤** — speak your source/destination (Web Speech API); "Kashmere Gate to IGI Airport" auto-fills both fields
- **Bilingual UI** — instant English ⇄ हिन्दी toggle
- **Secure auth** — signup/login with bcrypt (12 rounds), JWT, validation, rate limiting, Helmet, CORS lock-down
- **Journey history** for logged-in users
- **Emergency help** — nearby police/hospital + national helplines (100, 108, 1091, 112)

## 🏗️ Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Context API (Auth + i18n) |
| Backend | Node.js, Express, JWT, bcryptjs, express-validator, Helmet, express-rate-limit, Morgan |
| Database | lowdb (JSON file, zero setup) — repository pattern, easy to swap for MongoDB/PostgreSQL |
| AI | Anthropic Claude API + grounded context retrieval from local transport dataset |
| Voice | Browser Web Speech API |

## 🚀 Run in VS Code (5 minutes)
**Prerequisite:** [Node.js 18+](https://nodejs.org)

1. Unzip and open the `safarsaathi` folder in VS Code (`File → Open Folder`).
2. Open the terminal (`` Ctrl+` ``) and run:
   ```bash
   npm run install-all
   ```
3. Create backend config:
   ```bash
   cd backend
   cp .env.example .env        # Windows: copy .env.example .env
   ```
   Edit `backend/.env`:
   - `JWT_SECRET` → any long random string (generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - `ANTHROPIC_API_KEY` → *(optional)* your key from https://console.anthropic.com. Without it, the AI assistant uses the built-in rule-based planner.
4. Back in the project root, start both servers:
   ```bash
   cd ..
   npm run dev
   ```
5. Open **http://localhost:5173** 🎉  (API runs on http://localhost:5000)

> Voice input works best in **Google Chrome / Edge**.

## 📁 Project Structure
```
safarsaathi/
├── backend/
│   └── src/
│       ├── config/        db.js
│       ├── controllers/   auth, journey, ai, emergency
│       ├── middleware/    auth (JWT), rateLimiter, errorHandler
│       ├── models/        User (repository pattern)
│       ├── routes/        auth, journey, ai, emergency
│       ├── data/          transportData.json (hubs, metro/bus, e-rickshaw/auto pickup points)
│       └── utils/         jwt, validators
└── frontend/
    └── src/
        ├── components/    Navbar, MicButton, LanguageToggle, JourneyResult, ProtectedRoute
        ├── context/       AuthContext, LanguageContext
        ├── i18n/          en.json, hi.json
        ├── pages/         Home, Login, Signup, AIAssistant, Emergency, Profile
        └── services/      api.js (Axios + JWT interceptor)
```

## 🔌 API Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | – | Create account |
| POST | `/api/auth/login` | – | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/journey/hubs` | – | Supported places |
| POST | `/api/journey/plan` | optional | Plan journey `{from, to, priority}` |
| GET | `/api/journey/history` | ✅ | User's past searches |
| POST | `/api/ai/ask` | – | AI assistant `{message, history}` |
| GET | `/api/emergency/:place` | – | Nearby help + helplines |

## 🗺️ Data Strategy (important design decision)
- **Metro/bus data** → sourced from official/open transit data (DMRC, Open Transit Data) — structured & reliable.
- **Auto / e-rickshaw** → live tracking is infeasible, so we store **static "known pickup points"** per hub (low-maintenance) and plan to **crowdsource verification** from users.
- MVP scope: 6 major Delhi NCR hubs, expanded city by city.

## 🔒 Security Notes
Passwords hashed with bcrypt (12 rounds) · JWT auth · generic login errors (no user enumeration) · request body size limit · strict CORS · Helmet headers · global + auth-specific rate limits · input validation & sanitization.

## 🛣️ Roadmap
- Real GTFS/OTD integration for live metro & bus timings
- Crowdsourced pickup-point verification & ratings
- Map view (Leaflet/OpenStreetMap) and geolocation "use my location"
- Offline saved routes (PWA), SOS with live location sharing
- Move DB to MongoDB/PostgreSQL; add tests (Jest/Supertest) and CI

## 📄 License
MIT
