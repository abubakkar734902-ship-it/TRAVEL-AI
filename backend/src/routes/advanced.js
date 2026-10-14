// Advanced API Routes for Recommendations, Analytics, and Optimization
import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validation.js";

const router = Router();

// Get ML-based recommendations
router.get(
    "/recommendations",
    auth,
    (req, res) => {
        try {
            const { recommendationEngine } = req.app.locals;
            
            const recommendations = recommendationEngine.getHybridRecommendations(
                req.user.userId,
                req.query.travels ? JSON.parse(req.query.travels) : [],
                {
                    interests: req.query.interests ? req.query.interests.split(',') : [],
                    budgetRange: req.query.budget ? [0, parseInt(req.query.budget)] : [0, 100000]
                },
                parseInt(req.query.limit || 5)
            );

            res.json({
                success: true,
                recommendations,
                generatedAt: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
);

// Get trending destinations
router.get(
    "/trending",
    (req, res) => {
        try {
            const { recommendationEngine } = req.app.locals;
            const days = parseInt(req.query.days || 7);
            
            const trending = recommendationEngine.getTrendingDestinations(days);

            res.json({
                success: true,
                trending,
                timeWindow: `${days} days`
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
);

// Comprehensive risk assessment
router.post(
    "/risk-assessment",
    auth,
    (req, res) => {
        try {
            const { mlRiskScorer } = req.app.locals;
            const { destination, date, userProfile } = req.body;

            if (!destination) {
                return res.status(400).json({
                    error: "Destination is required"
                });
            }

            const assessment = mlRiskScorer.assessComprehensiveRisk(
                destination,
                date || new Date().toISOString(),
                userProfile || {}
            );

            res.json({
                success: true,
                assessment
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
);

// Optimize itinerary
router.post(
    "/optimize-itinerary",
    auth,
    (req, res) => {
        try {
            const { itineraryOptimizer } = req.app.locals;
            const { destination, days, budget, interests, activities } = req.body;

            if (!destination || !days || !budget) {
                return res.status(400).json({
                    error: "Destination, days, and budget are required"
                });
            }

            const optimized = itineraryOptimizer.generateOptimalItinerary(
                destination,
                days,
                budget,
                interests || [],
                activities || []
            );

            const metrics = itineraryOptimizer.calculateMetrics(optimized);

            res.json({
                success: true,
                optimized,
                metrics
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
);

// Get analytics/cache statistics
router.get(
    "/analytics",
    auth,
    (req, res) => {
        try {
            const { advancedCache, notificationService } = req.app.locals;

            res.json({
                success: true,
                cache: advancedCache.getStats(),
                notifications: notificationService.getStats(),
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
);

// Record user interaction (for ML training)
router.post(
    "/interaction",
    auth,
    (req, res) => {
        try {
            const { recommendationEngine } = req.app.locals;
            const { destination, actionType, metadata } = req.body;

            if (!destination || !actionType) {
                return res.status(400).json({
                    error: "Destination and actionType are required"
                });
            }

            recommendationEngine.recordInteraction(
                req.user.userId,
                destination,
                actionType,
                metadata || {}
            );

            res.json({
                success: true,
                message: "Interaction recorded"
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
);

// Get content-based recommendations
router.get(
    "/content-recommendations",
    (req, res) => {
        try {
            const { recommendationEngine } = req.app.locals;
            const preferences = {
                interests: req.query.interests ? req.query.interests.split(',') : []
            };

            const recommendations = recommendationEngine.contentBasedRecommendations(
                preferences,
                parseInt(req.query.limit || 5)
            );

            res.json({
                success: true,
                recommendations
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
);

// Clear cache (admin only)
router.delete(
    "/cache",
    auth,
    (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    error: "Unauthorized"
                });
            }

            const { advancedCache } = req.app.locals;
            advancedCache.clear();

            res.json({
                success: true,
                message: "Cache cleared"
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
);

export default router;
