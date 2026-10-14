// Advanced In-Memory Cache with LRU Strategy and Expiration
// Production-grade caching layer for performance optimization

class AdvancedCache {
    constructor(maxSize = 1000, defaultTTL = 3600000) { // 1 hour default TTL
        this.cache = new Map();
        this.metadata = new Map();
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
        this.accessCount = new Map();
        this.hitRate = 0;
        this.missRate = 0;
    }

    // Set cache with TTL
    set(key, value, ttl = this.defaultTTL) {
        // Implement LRU eviction if at capacity
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }

        const expiresAt = Date.now() + ttl;
        this.cache.set(key, value);
        this.metadata.set(key, {
            expiresAt,
            createdAt: Date.now(),
            accessCount: 0,
            ttl
        });

        return value;
    }

    // Get cache with automatic expiration check
    get(key) {
        if (!this.cache.has(key)) {
            this.missRate++;
            return null;
        }

        const metadata = this.metadata.get(key);
        
        // Check if expired
        if (Date.now() > metadata.expiresAt) {
            this.cache.delete(key);
            this.metadata.delete(key);
            this.missRate++;
            return null;
        }

        // Update access metadata
        metadata.accessCount++;
        this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
        this.hitRate++;

        return this.cache.get(key);
    }

    // Cache with memoization pattern
    memo(key, fn, ttl = this.defaultTTL) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }

        const result = fn();
        this.set(key, result, ttl);
        return result;
    }

    // Async memoization
    async memoAsync(key, asyncFn, ttl = this.defaultTTL) {
        const cached = this.get(key);
        if (cached !== null) {
            return cached;
        }

        const result = await asyncFn();
        this.set(key, result, ttl);
        return result;
    }

    // Evict least recently used item
    evictLRU() {
        let lruKey = null;
        let minAccess = Infinity;

        for (const [key, count] of this.accessCount.entries()) {
            if (count < minAccess) {
                minAccess = count;
                lruKey = key;
            }
        }

        if (lruKey) {
            this.cache.delete(lruKey);
            this.metadata.delete(lruKey);
            this.accessCount.delete(lruKey);
        }
    }

    // Batch set operation
    setMultiple(entries, ttl = this.defaultTTL) {
        entries.forEach(([key, value]) => this.set(key, value, ttl));
    }

    // Batch get operation
    getMultiple(keys) {
        return keys.reduce((result, key) => {
            const value = this.get(key);
            if (value !== null) {
                result[key] = value;
            }
            return result;
        }, {});
    }

    // Pattern-based deletion
    deletePattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = [];

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => {
            this.cache.delete(key);
            this.metadata.delete(key);
            this.accessCount.delete(key);
        });

        return keysToDelete.length;
    }

    // Clear all cache
    clear() {
        this.cache.clear();
        this.metadata.clear();
        this.accessCount.clear();
    }

    // Get cache statistics
    getStats() {
        const totalRequests = this.hitRate + this.missRate;
        const hitRatePercentage = totalRequests > 0 ? 
            Math.round((this.hitRate / totalRequests) * 100) : 0;

        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.hitRate,
            missRate: this.missRate,
            hitRatePercentage,
            totalRequests,
            utilizationPercentage: Math.round((this.cache.size / this.maxSize) * 100)
        };
    }

    // Cleanup expired entries
    cleanup() {
        let cleaned = 0;
        const now = Date.now();

        for (const [key, metadata] of this.metadata.entries()) {
            if (now > metadata.expiresAt) {
                this.cache.delete(key);
                this.metadata.delete(key);
                this.accessCount.delete(key);
                cleaned++;
            }
        }

        return cleaned;
    }

    // Auto cleanup interval
    startAutoCleanup(interval = 60000) { // Every minute
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, interval);
    }

    // Stop auto cleanup
    stopAutoCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}

export default new AdvancedCache();
