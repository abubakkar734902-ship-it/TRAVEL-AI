// Advanced Input Validation Middleware with Zod Schemas
// Ensures all inputs are validated and sanitized before processing

import { z } from 'zod';

// Define comprehensive validation schemas
const schemas = {
    // Authentication schemas
    login: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters')
    }),

    register: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string(),
        name: z.string().min(2, 'Name must be at least 2 characters'),
        phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits')
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"]
    }),

    // Trip/Itinerary schemas
    createTrip: z.object({
        destination: z.string().min(2, 'Destination is required'),
        startDate: z.string().datetime('Invalid start date'),
        endDate: z.string().datetime('Invalid end date'),
        budget: z.number().positive('Budget must be positive'),
        interests: z.array(z.string()).min(1, 'At least one interest required'),
        travelers: z.number().int().min(1, 'At least 1 traveler required'),
        tripType: z.enum(['solo', 'couple', 'family', 'group'])
    }).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
        message: "End date must be after start date",
        path: ["endDate"]
    }),

    updateItinerary: z.object({
        tripId: z.string().uuid('Invalid trip ID'),
        activities: z.array(z.object({
            day: z.number().int().min(1),
            title: z.string().min(2),
            description: z.string().optional(),
            time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
            duration: z.number().positive(),
            location: z.string().min(2),
            estimatedCost: z.number().nonnegative()
        }))
    }),

    // Budget schemas
    logExpense: z.object({
        tripId: z.string().uuid('Invalid trip ID'),
        amount: z.number().positive('Amount must be positive'),
        category: z.enum(['food', 'transport', 'accommodation', 'activities', 'shopping', 'other']),
        description: z.string().min(2),
        date: z.string().datetime('Invalid date')
    }),

    // Safety schemas
    reportIncident: z.object({
        destination: z.string().min(2),
        incidentType: z.enum(['theft', 'harassment', 'accident', 'health', 'other']),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        location: z.string().min(2),
        timestamp: z.string().datetime('Invalid timestamp')
    }),

    // Feedback schemas
    leaveFeedback: z.object({
        tripId: z.string().uuid('Invalid trip ID'),
        rating: z.number().int().min(1).max(5),
        title: z.string().min(5, 'Title must be at least 5 characters'),
        description: z.string().min(10, 'Description must be at least 10 characters'),
        tags: z.array(z.string()).min(1, 'At least one tag required'),
        wouldRecommend: z.boolean()
    }),

    // Query schemas
    getDestinations: z.object({
        budget: z.number().positive().optional(),
        interests: z.string().optional(),
        season: z.enum(['summer', 'monsoon', 'winter']).optional(),
        duration: z.number().int().positive().optional(),
        limit: z.number().int().min(1).max(100).optional()
    }),

    // Search schemas
    search: z.object({
        query: z.string().min(2, 'Search query must be at least 2 characters').max(100),
        filters: z.object({
            type: z.enum(['destination', 'activity', 'hotel']).optional(),
            priceRange: z.object({
                min: z.number().nonnegative(),
                max: z.number().positive()
            }).optional(),
            ratings: z.number().min(1).max(5).optional()
        }).optional()
    })
};

// Middleware factory
export function validateBody(schemaName) {
    return (req, res, next) => {
        try {
            const schema = schemas[schemaName];
            
            if (!schema) {
                return res.status(400).json({
                    error: 'Invalid schema name'
                });
            }

            const validated = schema.parse(req.body);
            req.validated = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }

            return res.status(500).json({
                error: 'Validation error'
            });
        }
    };
}

// Validate query parameters
export function validateQuery(schemaName) {
    return (req, res, next) => {
        try {
            const schema = schemas[schemaName];
            
            if (!schema) {
                return res.status(400).json({
                    error: 'Invalid schema name'
                });
            }

            const validated = schema.parse(req.query);
            req.validated = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }

            return res.status(500).json({
                error: 'Validation error'
            });
        }
    };
}

// Custom schema validator
export function createCustomValidator(customSchema) {
    return (req, res, next) => {
        try {
            const validated = customSchema.parse(req.body);
            req.validated = validated;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors
                });
            }

            return res.status(500).json({
                error: 'Validation error'
            });
        }
    };
}

// Export schemas for reuse
export const validationSchemas = schemas;
