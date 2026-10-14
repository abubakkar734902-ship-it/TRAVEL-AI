# SIH 2026 – Problem Statement 207
## AI Travel & Tourism Super Platform

A hackathon-ready full-stack starter implementing the advanced SIH-207 concept:

- AI autonomous trip planner
- AI travel copilot/chat
- Dynamic itinerary replanning
- Weather/risk engine
- Crowd prediction
- Budget optimizer + expense tracker
- Destination recognition placeholder
- AR/VR-ready destination experience
- Multilingual voice assistant UI
- Offline/PWA travel mode
- Smart route optimization
- Hyperlocal marketplace
- AI review summarization
- Real-time tourism alerts
- Digital travel wallet
- Group trip planning
- Safety/SOS module
- Maps/weather integration adapters
- PostgreSQL-ready persistence
- Docker setup
- JWT authentication foundation
- OTP login flow foundation

## Stack

Frontend:
- React + Vite
- React Router
- Axios
- PWA/offline cache foundation

Backend:
- Node.js + Express
- JWT
- PostgreSQL-ready data layer
- Zod validation
- Socket.IO for real-time events
- AI provider abstraction
- Weather/maps/provider abstractions

## Run

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend: http://localhost:5000

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

### 3. Optional PostgreSQL

```bash
docker compose up -d postgres
```

The app works in demo/mock mode without external API keys.

## Important

This repository is a strong SIH prototype foundation, not a production deployment.
Add real provider credentials for:
- Maps
- Weather
- AI/LLM
- SMS OTP
- Payments
- Hotel/transport inventory

Never commit secrets.

## Suggested SIH demo flow

1. User logs in with OTP/demo OTP.
2. Enters budget, days, interests and starting location.
3. AI generates an itinerary.
4. Weather/risk engine checks the plan.
5. Crowd prediction changes visit times.
6. User adds expenses and sees budget prediction.
7. Dynamic replanning demonstrates a simulated rain alert.
8. Safety mode displays SOS and nearby emergency resources.
9. Digital wallet stores trip tickets/QR references.
10. Hyperlocal marketplace demonstrates local experiences.
