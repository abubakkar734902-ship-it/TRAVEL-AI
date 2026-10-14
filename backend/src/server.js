import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trips.js";
import travelRoutes from "./routes/travel.js";
import safetyRoutes from "./routes/safety.js";
import marketplaceRoutes from "./routes/marketplace.js";

// Advanced services
import recommendationEngine from "./services/recommendationEngine.js";
import mlRiskScorer from "./services/mlRiskScorer.js";
import advancedCache from "./services/advancedCache.js";
import notificationService from "./services/notificationService.js";
import itineraryOptimizer from "./services/itineraryOptimizer.js";

// Security middleware
import {
    userRateLimiter,
    csrfProtection,
    sanitizationMiddleware,
    securityHeadersMiddleware,
    cspMiddleware,
    auditLoggingMiddleware
} from "./middleware/securityEnhancements.js";

dotenv.config();

const app = express();

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
});


// Security headers
app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        }
    })
);

// Additional security headers
app.use(securityHeadersMiddleware);
app.use(cspMiddleware);

// CORS
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    })
);

// JSON body limit
app.use(
    express.json({
        limit: "100kb"
    })
);

// Input sanitization
app.use(sanitizationMiddleware);

// Cookies
app.use(cookieParser());

// Advanced rate limiter
app.use(userRateLimiter.middleware());

// CSRF Protection
app.use(csrfProtection.middleware());

// Audit logging
app.use(auditLoggingMiddleware);

// Authentication rate limiter
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 30,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        error:
            "Too many authentication requests. Please try again later."
    }
});


app.use(
    "/api/auth",
    authLimiter
);


// Health check
app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            service:
                "TravelAI SIH 207 Backend",

            status:
                "Running",

            time:
                new Date().toISOString()

        });

    }
);


// Routes
app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/trips",
    tripRoutes
);

app.use(
    "/api/travel",
    travelRoutes
);

app.use(
    "/api/safety",
    safetyRoutes
);

app.use(
    "/api/marketplace",
    marketplaceRoutes
);

// Advanced routes
import advancedRoutes from "./routes/advanced.js";
app.use(
    "/api/advanced",
    advancedRoutes
);


// Socket.IO with real-time features
io.on(
    "connection",
    socket => {

        console.log(
            "Client connected:",
            socket.id
        );


        socket.emit(
            "connected",
            {
                message:
                    "TravelAI realtime service connected",
                serverTime: Date.now(),
                cacheStats: advancedCache.getStats(),
                notificationStats: notificationService.getStats()
            }
        );

        // User registration for notifications
        socket.on("register-user", (userId) => {
            notificationService.subscribe(userId, socket.id);
            socket.join(`user:${userId}`);
            console.log(`User ${userId} registered for notifications`);
        });

        // Trip-based notifications
        socket.on(
            "join-trip",
            tripId => {

                socket.join(
                    `trip:${tripId}`
                );

            }
        );

        // Listen for recommendation requests
        socket.on("get-recommendations", (data) => {
            const recommendations = recommendationEngine.getHybridRecommendations(
                data.userId,
                data.userTravels || [],
                data.preferences || {}
            );

            socket.emit("recommendations", {
                success: true,
                recommendations,
                timestamp: Date.now()
            });
        });

        // Listen for risk assessment requests
        socket.on("assess-risk", (data) => {
            const riskAssessment = mlRiskScorer.assessComprehensiveRisk(
                data.destination,
                data.date || new Date().toISOString(),
                data.userProfile || {}
            );

            socket.emit("risk-assessment", {
                success: true,
                assessment: riskAssessment,
                timestamp: Date.now()
            });
        });

        // Real-time optimization
        socket.on("optimize-itinerary", (data) => {
            const optimized = itineraryOptimizer.generateOptimalItinerary(
                data.destination,
                data.days,
                data.budget,
                data.interests || [],
                data.activities || []
            );

            const metrics = itineraryOptimizer.calculateMetrics(optimized);

            socket.emit("itinerary-optimized", {
                success: true,
                optimized,
                metrics,
                timestamp: Date.now()
            });
        });

        socket.on(
            "disconnect",
            () => {

                console.log(
                    "Client disconnected:",
                    socket.id
                );

            }
        );

    }
);


app.locals.io = io;
app.locals.advancedCache = advancedCache;
app.locals.notificationService = notificationService;
app.locals.recommendationEngine = recommendationEngine;
app.locals.mlRiskScorer = mlRiskScorer;
app.locals.itineraryOptimizer = itineraryOptimizer;


const PORT =
    Number(process.env.PORT) || 5000;


server.listen(
    PORT,
    () => {

        console.log(
            `TravelAI backend running on http://localhost:${PORT}`
        );

    }
);