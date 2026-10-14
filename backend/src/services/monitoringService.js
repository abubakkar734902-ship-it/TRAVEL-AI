// Monitoring & Analytics Service
// Integrates Datadog, New Relic, Prometheus, and Sentry

import axios from 'axios';

// ========== DATADOG INTEGRATION ==========

export class DatadogMonitoring {
    constructor(apiKey, site = 'datadoghq.com') {
        this.apiKey = apiKey;
        this.site = site;
        this.baseURL = `https://api.${site}`;
        this.metricsURL = `https://api.${site}/api/v1/series`;
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'DD-API-KEY': apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Send custom metric to Datadog
     */
    async sendMetric(metricName, value, timestamp = Date.now(), tags = {}) {
        try {
            const tagArray = Object.entries(tags)
                .map(([k, v]) => `${k}:${v}`);

            const response = await axios.post(this.metricsURL, {
                series: [
                    {
                        metric: `travelai.${metricName}`,
                        points: [[Math.floor(timestamp / 1000), value]],
                        type: 'gauge',
                        tags: tagArray
                    }
                ]
            }, {
                headers: {
                    'DD-API-KEY': this.apiKey
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error sending Datadog metric:', error.message);
        }
    }

    /**
     * Send event to Datadog
     */
    async sendEvent(title, text, eventType = 'info', tags = {}) {
        try {
            const tagArray = Object.entries(tags)
                .map(([k, v]) => `${k}:${v}`);

            const response = await this.client.post('/api/v1/events', {
                title: title,
                text: text,
                priority: eventType === 'error' ? 'normal' : 'low',
                tags: tagArray,
                alert_type: eventType
            });

            return response.data;
        } catch (error) {
            console.error('Error sending Datadog event:', error.message);
        }
    }

    /**
     * Query Datadog metrics
     */
    async queryMetrics(query, from, to) {
        try {
            const response = await this.client.get('/api/v1/query', {
                params: {
                    query: query,
                    from: Math.floor(from / 1000),
                    to: Math.floor(to / 1000)
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error querying Datadog metrics:', error.message);
        }
    }
}

// ========== NEW RELIC INTEGRATION ==========

export class NewRelicMonitoring {
    constructor(apiKey, accountId) {
        this.apiKey = apiKey;
        this.accountId = accountId;
        this.baseURL = 'https://api.newrelic.com/v1';
        this.nrqlURL = 'https://api.newrelic.com/graphql';
    }

    /**
     * Send custom event to New Relic
     */
    async sendEvent(eventType, attributes = {}) {
        try {
            const response = await axios.post(
                `https://insights-collector.newrelic.com/v1/accounts/${this.accountId}/events`,
                {
                    eventType: eventType,
                    ...attributes,
                    timestamp: Date.now()
                },
                {
                    headers: {
                        'X-Insert-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error sending New Relic event:', error.message);
        }
    }

    /**
     * Query NRQL
     */
    async queryNRQL(nrql) {
        try {
            const response = await axios.post(
                this.nrqlURL,
                {
                    query: `{
                        actor {
                            account(id: ${this.accountId}) {
                                nrql(query: "${nrql}") {
                                    results
                                }
                            }
                        }
                    }`
                },
                {
                    headers: {
                        'API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error querying NRQL:', error.message);
        }
    }
}

// ========== PROMETHEUS METRICS ==========

export class PrometheusMetrics {
    constructor() {
        this.metrics = new Map();
        this.initDefaultMetrics();
    }

    initDefaultMetrics() {
        // Counter for API requests
        this.metrics.set('api_requests_total', {
            type: 'counter',
            help: 'Total API requests',
            value: 0
        });

        // Histogram for request duration
        this.metrics.set('api_request_duration_ms', {
            type: 'histogram',
            help: 'API request duration in milliseconds',
            buckets: [10, 50, 100, 500, 1000, 5000],
            values: []
        });

        // Gauge for active connections
        this.metrics.set('active_connections', {
            type: 'gauge',
            help: 'Number of active WebSocket connections',
            value: 0
        });

        // Counter for database queries
        this.metrics.set('db_queries_total', {
            type: 'counter',
            help: 'Total database queries',
            value: 0
        });

        // Gauge for cache hit rate
        this.metrics.set('cache_hit_rate', {
            type: 'gauge',
            help: 'Cache hit rate percentage',
            value: 0
        });

        // Counter for errors
        this.metrics.set('errors_total', {
            type: 'counter',
            help: 'Total errors',
            value: 0
        });
    }

    /**
     * Increment counter
     */
    incrementCounter(metricName, value = 1, labels = {}) {
        if (this.metrics.has(metricName)) {
            const metric = this.metrics.get(metricName);
            if (metric.type === 'counter') {
                metric.value += value;
                metric.labels = labels;
            }
        }
    }

    /**
     * Set gauge value
     */
    setGauge(metricName, value, labels = {}) {
        if (this.metrics.has(metricName)) {
            const metric = this.metrics.get(metricName);
            if (metric.type === 'gauge') {
                metric.value = value;
                metric.labels = labels;
            }
        }
    }

    /**
     * Record histogram value
     */
    recordHistogram(metricName, value, labels = {}) {
        if (this.metrics.has(metricName)) {
            const metric = this.metrics.get(metricName);
            if (metric.type === 'histogram') {
                metric.values.push(value);
                metric.labels = labels;
            }
        }
    }

    /**
     * Get Prometheus formatted output
     */
    getMetrics() {
        let output = '';

        for (const [name, metric] of this.metrics.entries()) {
            output += `# HELP ${name} ${metric.help}\n`;
            output += `# TYPE ${name} ${metric.type}\n`;

            if (metric.type === 'counter' || metric.type === 'gauge') {
                const labels = metric.labels 
                    ? `{${Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}` 
                    : '';
                output += `${name}${labels} ${metric.value}\n`;
            } else if (metric.type === 'histogram') {
                const sum = metric.values.reduce((a, b) => a + b, 0);
                const avg = metric.values.length > 0 ? sum / metric.values.length : 0;
                output += `${name}_sum ${sum}\n`;
                output += `${name}_count ${metric.values.length}\n`;

                metric.buckets.forEach(bucket => {
                    const count = metric.values.filter(v => v <= bucket).length;
                    output += `${name}_bucket{le="${bucket}"} ${count}\n`;
                });
                output += `${name}_bucket{le="+Inf"} ${metric.values.length}\n`;
            }
        }

        return output;
    }
}

// ========== SENTRY ERROR TRACKING ==========

export class SentryErrorTracking {
    constructor(dsn) {
        this.dsn = dsn;
        this.projectId = dsn.split('/').pop();
        this.baseURL = `https://sentry.io/api/0/projects`;
    }

    /**
     * Capture exception
     */
    async captureException(error, context = {}) {
        try {
            const response = await axios.post(
                `${this.baseURL}/${this.projectId}/events/`,
                {
                    message: error.message,
                    exception: {
                        values: [
                            {
                                type: error.name || 'Error',
                                value: error.message,
                                stacktrace: {
                                    frames: this.parseStackTrace(error.stack)
                                }
                            }
                        ]
                    },
                    level: 'error',
                    tags: context.tags || {},
                    extra: context.extra || {},
                    user: context.user || {}
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (err) {
            console.error('Error sending to Sentry:', err.message);
        }
    }

    /**
     * Parse stack trace
     */
    parseStackTrace(stack) {
        if (!stack) return [];

        return stack.split('\n').map((line, index) => ({
            lineno: index,
            filename: line.split(' ')[0],
            function: line.includes('at') ? line.split('at')[1].trim() : 'unknown',
            raw_function: line
        }));
    }

    /**
     * Capture message
     */
    async captureMessage(message, level = 'info', context = {}) {
        try {
            const response = await axios.post(
                `${this.baseURL}/${this.projectId}/events/`,
                {
                    message: message,
                    level: level,
                    tags: context.tags || {},
                    extra: context.extra || {},
                    user: context.user || {}
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (err) {
            console.error('Error sending message to Sentry:', err.message);
        }
    }
}

// ========== UNIFIED MONITORING SERVICE ==========

export class MonitoringService {
    constructor(config = {}) {
        this.datadog = config.datadogApiKey
            ? new DatadogMonitoring(config.datadogApiKey, config.datadogSite || 'datadoghq.com')
            : null;

        this.newrelic = config.newrelicApiKey && config.newrelicAccountId
            ? new NewRelicMonitoring(config.newrelicApiKey, config.newrelicAccountId)
            : null;

        this.prometheus = new PrometheusMetrics();

        this.sentry = config.sentryDsn
            ? new SentryErrorTracking(config.sentryDsn)
            : null;

        this.environment = config.environment || 'development';
    }

    /**
     * Log event to all monitoring services
     */
    async logEvent(eventName, data = {}) {
        const timestamp = Date.now();

        // Send to Datadog
        if (this.datadog) {
            await this.datadog.sendEvent(
                eventName,
                JSON.stringify(data),
                data.level || 'info',
                { environment: this.environment, service: 'travelai' }
            );
        }

        // Send to New Relic
        if (this.newrelic) {
            await this.newrelic.sendEvent('TravelAIEvent', {
                eventName: eventName,
                ...data,
                timestamp: timestamp
            });
        }
    }

    /**
     * Record metric
     */
    recordMetric(metricName, value, tags = {}) {
        const defaultTags = {
            environment: this.environment,
            service: 'travelai',
            ...tags
        };

        if (this.datadog) {
            this.datadog.sendMetric(metricName, value, Date.now(), defaultTags);
        }

        if (this.prometheus) {
            this.prometheus.setGauge(metricName, value, defaultTags);
        }
    }

    /**
     * Track error
     */
    async trackError(error, context = {}) {
        if (this.sentry) {
            await this.sentry.captureException(error, {
                tags: { environment: this.environment },
                ...context
            });
        }

        this.prometheus.incrementCounter('errors_total');
    }

    /**
     * Get Prometheus metrics
     */
    getPrometheusMetrics() {
        return this.prometheus.getMetrics();
    }

    /**
     * Record API request
     */
    recordApiRequest(method, path, duration, statusCode) {
        this.prometheus.incrementCounter('api_requests_total', 1, { method, path, status: statusCode });
        this.prometheus.recordHistogram('api_request_duration_ms', duration, { method, path });
    }
}

export default MonitoringService;
