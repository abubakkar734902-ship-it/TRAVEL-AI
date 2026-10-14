# Architecture

```text
React / PWA
    |
    v
Express API + Socket.IO
    |
    +-- Auth / OTP / JWT
    +-- AI Orchestrator
    |     +-- Itinerary planner
    |     +-- Travel copilot
    |     +-- Recommendation engine
    |     +-- Review intelligence
    |
    +-- Real-time intelligence
    |     +-- Weather
    |     +-- Crowd
    |     +-- Risk
    |     +-- Alerts
    |
    +-- Travel services
    |     +-- Routes
    |     +-- Marketplace
    |     +-- Safety
    |     +-- Wallet
    |
    v
PostgreSQL / Redis
    |
    +-- External APIs
          Maps / Weather / Events / Hotels / Transport / Payment / SMS
```

The current code uses mock providers so the project can run without paid API keys.
