# API Reference

Base URL: `http://localhost:5000/api`

## Auth
- POST `/auth/request-otp`
- POST `/auth/verify-otp`

## Trips
- POST `/trips/plan`
- POST `/trips/replan`

## Travel intelligence
- GET `/travel/destinations`
- GET `/travel/alerts`
- GET `/travel/weather?city=Mysuru`
- GET `/travel/risk?rain=65&crowd=58&road=20`
- POST `/travel/copilot`
- POST `/travel/optimize-route`
- POST `/travel/review-summary`

## Safety
- GET `/safety/nearby`
- POST `/safety/sos`

## Marketplace
- GET `/marketplace/experiences`
- POST `/marketplace/booking`

Protected endpoints require:

`Authorization: Bearer <JWT>`
