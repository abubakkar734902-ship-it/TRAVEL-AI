// Advanced Security Enhancement Middleware
// Implements multiple security layers including rate limiting, CSRF protection, sanitization

import rateLimit from 'express-rate-limit';

// Per-user rate limiter for precise control
class UserRateLimiter {
    constructor() {
        this.userLimits = new Map();
        this.config = {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100,
            keyGenerator: (req) => req.user?.userId || req.ip
        };
    }

    middleware() {
        return (req, res, next) => {
            const key = this.config.keyGenerator(req);
            const now = Date.now();

            if (!this.userLimits.has(key)) {
                this.userLimits.set(key, {
                    requests: 0,
                    resetTime: now + this.config.windowMs,
                    blocked: false
                });
            }

            const limit = this.userLimits.get(key);

            // Reset if window expired
            if (now > limit.resetTime) {
                limit.requests = 0;
                limit.resetTime = now + this.config.windowMs;
                limit.blocked = false;
            }

            limit.requests++;

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', this.config.maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, this.config.maxRequests - limit.requests));
            res.setHeader('X-RateLimit-Reset', limit.resetTime);

            // Block if exceeded
            if (limit.requests > this.config.maxRequests) {
                limit.blocked = true;
                return res.status(429).json({
                    error: 'Too many requests',
                    retryAfter: Math.ceil((limit.resetTime - now) / 1000)
                });
            }

            next();
        };
    }

    // Get stats for a user
    getStats(userId) {
        return this.userLimits.get(userId) || null;
    }

    // Reset user limit
    reset(userId) {
        this.userLimits.delete(userId);
    }
}

// Input sanitization
export function sanitizeInput(data) {
    if (typeof data === 'string') {
        return data
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }

    if (Array.isArray(data)) {
        return data.map(item => sanitizeInput(item));
    }

    if (typeof data === 'object' && data !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }

    return data;
}

// Sanitization middleware
export function sanitizationMiddleware(req, res, next) {
    if (req.body) {
        req.body = sanitizeInput(req.body);
    }
    if (req.query) {
        req.query = sanitizeInput(req.query);
    }
    next();
}

// CSRF Token generation and validation
class CSRFProtection {
    constructor() {
        this.tokens = new Map();
    }

    // Generate CSRF token
    generateToken(sessionId) {
        const token = `csrf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.tokens.set(sessionId, {
            token,
            createdAt: Date.now(),
            used: false
        });
        return token;
    }

    // Validate CSRF token
    validateToken(sessionId, token) {
        const stored = this.tokens.get(sessionId);

        if (!stored || stored.used) {
            return false;
        }

        // Token valid for 1 hour
        if (Date.now() - stored.createdAt > 3600000) {
            return false;
        }

        return stored.token === token;
    }

    // Mark token as used
    useToken(sessionId) {
        const stored = this.tokens.get(sessionId);
        if (stored) {
            stored.used = true;
        }
    }

    // Middleware for CSRF validation (POST/PUT/DELETE only)
    middleware() {
        return (req, res, next) => {
            // Skip CSRF check for GET requests
            if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
                return next();
            }

            // Skip for auth endpoints
            if (['/auth/login', '/auth/register'].includes(req.path)) {
                return next();
            }

            const token = req.headers['x-csrf-token'] || req.body._csrf;
            const sessionId = req.sessionID || req.user?.userId;

            if (!sessionId || !token || !this.validateToken(sessionId, token)) {
                return res.status(403).json({
                    error: 'CSRF validation failed'
                });
            }

            this.useToken(sessionId);
            next();
        };
    }
}

// Content Security Policy headers
export function cspMiddleware(req, res, next) {
    res.setHeader(
        'Content-Security-Policy',
        `
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval';
            style-src 'self' 'unsafe-inline';
            img-src 'self' https:;
            font-src 'self';
            connect-src 'self' https:;
            frame-ancestors 'none';
            upgrade-insecure-requests;
        `.replace(/\s+/g, ' ')
    );
    next();
}

// Security headers middleware
export function securityHeadersMiddleware(req, res, next) {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Disable frame embedding
    res.setHeader('X-Frame-Options', 'DENY');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Feature policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
}

// Request logging for security audit
class AuditLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 10000;
    }

    log(req, res, action) {
        const logEntry = {
            timestamp: Date.now(),
            userId: req.user?.userId || 'anonymous',
            ip: req.ip,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            action,
            userAgent: req.headers['user-agent']
        };

        this.logs.push(logEntry);

        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        return logEntry;
    }

    // Get audit logs
    getLogs(filters = {}) {
        return this.logs.filter(log => {
            for (const [key, value] of Object.entries(filters)) {
                if (log[key] !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    // Export logs
    export() {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Audit logging middleware
export function auditLoggingMiddleware(req, res, next) {
    const originalSend = res.send;

    res.send = function(data) {
        auditLogger.log(req, res, 'request_completed');
        originalSend.call(this, data);
    };

    next();
}

// Export instances
const userRateLimiter = new UserRateLimiter();
const csrfProtection = new CSRFProtection();
const auditLogger = new AuditLogger();

export {
    userRateLimiter,
    csrfProtection,
    auditLogger,
    UserRateLimiter,
    CSRFProtection,
    AuditLogger
};
