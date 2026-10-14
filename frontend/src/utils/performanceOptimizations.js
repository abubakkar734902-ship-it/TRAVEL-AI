// Advanced Performance Optimization Utilities
// Includes caching, memoization, lazy loading, code splitting

// IndexedDB wrapper for client-side persistence
class IndexedDBCache {
    constructor(dbName = 'travelai', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('cache')) {
                    db.createObjectStore('cache', { keyPath: 'key' });
                }
            };
        });
    }

    async set(key, value, ttl = 3600000) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');

        return new Promise((resolve, reject) => {
            const request = store.put({
                key,
                value,
                expiresAt: Date.now() + ttl,
                createdAt: Date.now()
            });

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(value);
        });
    }

    async get(key) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');

        return new Promise((resolve, reject) => {
            const request = store.get(key);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const result = request.result;

                if (!result) {
                    resolve(null);
                    return;
                }

                // Check if expired
                if (Date.now() > result.expiresAt) {
                    // Delete expired entry
                    const deleteRequest = store.delete(key);
                    deleteRequest.onsuccess = () => resolve(null);
                    deleteRequest.onerror = () => resolve(null);
                } else {
                    resolve(result.value);
                }
            };
        });
    }

    async delete(key) {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');

        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }

    async clear() {
        if (!this.db) await this.init();

        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');

        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

// Service Worker registration for offline support
export class OfflineSupport {
    static async register() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
                return registration;
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    static isOnline() {
        return navigator.onLine;
    }

    static onOnline(callback) {
        window.addEventListener('online', callback);
        return () => window.removeEventListener('online', callback);
    }

    static onOffline(callback) {
        window.addEventListener('offline', callback);
        return () => window.removeEventListener('offline', callback);
    }
}

// Performance monitoring
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
    }

    mark(label) {
        performance.mark(label);
    }

    measure(label, startMark, endMark) {
        performance.measure(label, startMark, endMark);
        const measure = performance.getEntriesByName(label)[0];
        this.metrics.set(label, measure.duration);
        return measure.duration;
    }

    getMetrics() {
        return Object.fromEntries(this.metrics);
    }

    logMetrics() {
        console.table(this.getMetrics());
    }

    getNavigationTiming() {
        const timing = performance.getEntriesByType('navigation')[0];
        return {
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            tcp: timing.connectEnd - timing.connectStart,
            ttfb: timing.responseStart - timing.requestStart,
            download: timing.responseEnd - timing.responseStart,
            domInteractive: timing.domInteractive - timing.fetchStart,
            domComplete: timing.domComplete - timing.fetchStart,
            loadComplete: timing.loadEventEnd - timing.fetchStart
        };
    }
}

// Intersection Observer for lazy loading
export function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Request deduplication
export class RequestDeduplicator {
    constructor() {
        this.pending = new Map();
    }

    async deduplicate(key, fetcher) {
        if (this.pending.has(key)) {
            return this.pending.get(key);
        }

        const promise = fetcher().finally(() => {
            this.pending.delete(key);
        });

        this.pending.set(key, promise);
        return promise;
    }
}

// Memory-efficient image optimization
export class ImageOptimizer {
    static compressImage(file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(resolve, 'image/jpeg', quality);
                };
            };
        });
    }
}

// Virtual scrolling helper
export class VirtualScroller {
    constructor(container, itemHeight = 50) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.items = [];
        this.visibleRange = { start: 0, end: 0 };
    }

    setItems(items) {
        this.items = items;
        this.updateVisibleRange();
    }

    updateVisibleRange() {
        const scrollTop = this.container.scrollTop;
        const containerHeight = this.container.clientHeight;

        this.visibleRange.start = Math.floor(scrollTop / this.itemHeight);
        this.visibleRange.end = Math.ceil((scrollTop + containerHeight) / this.itemHeight);
    }

    getVisibleItems() {
        return this.items.slice(this.visibleRange.start, this.visibleRange.end);
    }
}

// Memory leak detector
export class MemoryLeakDetector {
    static async checkMemory() {
        if (performance.memory) {
            const usage = performance.memory;
            return {
                usedJSHeapSize: (usage.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                totalJSHeapSize: (usage.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
                jsHeapSizeLimit: (usage.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
                ratio: ((usage.usedJSHeapSize / usage.jsHeapSizeLimit) * 100).toFixed(2) + '%'
            };
        }
        return null;
    }

    static monitorMemory(interval = 5000) {
        return setInterval(async () => {
            const memory = await this.checkMemory();
            if (memory && parseFloat(memory.ratio) > 80) {
                console.warn('High memory usage detected:', memory);
            }
        }, interval);
    }
}

// Bundle size optimization helpers
export const CodeSplitting = {
    lazyLoadComponent: (importFunc, fallback) => {
        return React.lazy(() => 
            importFunc().catch(() => ({
                default: fallback || (() => <div>Component failed to load</div>)
            }))
        );
    }
};

// Export cache instance
export const cache = new IndexedDBCache();

// Initialize all optimizations
export function initializePerformanceOptimizations() {
    // Register service worker
    OfflineSupport.register();

    // Setup lazy loading
    setupLazyLoading();

    // Monitor memory
    MemoryLeakDetector.monitorMemory();

    // Monitor performance
    const perfMonitor = new PerformanceMonitor();
    window.addEventListener('load', () => {
        const navigationTiming = perfMonitor.getNavigationTiming();
        console.log('Performance Metrics:', navigationTiming);
    });

    return {
        cache,
        OfflineSupport,
        PerformanceMonitor: perfMonitor,
        RequestDeduplicator
    };
}

export default {
    cache,
    IndexedDBCache,
    OfflineSupport,
    PerformanceMonitor,
    ImageOptimizer,
    VirtualScroller,
    MemoryLeakDetector,
    RequestDeduplicator,
    initializePerformanceOptimizations
};
