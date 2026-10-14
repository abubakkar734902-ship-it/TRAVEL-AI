// Real-time Notification Service with WebSocket Support
// Handles push notifications, real-time alerts, and user notifications

class NotificationService {
    constructor() {
        this.subscribers = new Map(); // userId -> Set of socket connections
        this.notificationQueue = [];
        this.notificationHistory = new Map();
        this.preferences = new Map();
    }

    // Register subscriber for real-time updates
    subscribe(userId, socketId) {
        if (!this.subscribers.has(userId)) {
            this.subscribers.set(userId, new Set());
        }
        this.subscribers.get(userId).add(socketId);
        return socketId;
    }

    // Unsubscribe from notifications
    unsubscribe(userId, socketId) {
        if (this.subscribers.has(userId)) {
            this.subscribers.get(userId).delete(socketId);
            if (this.subscribers.get(userId).size === 0) {
                this.subscribers.delete(userId);
            }
        }
    }

    // Send notification to specific user
    notifyUser(userId, notification) {
        const enriched = this.enrichNotification(notification, userId);
        
        if (this.subscribers.has(userId)) {
            return {
                success: true,
                recipients: this.subscribers.get(userId).size,
                notification: enriched
            };
        }

        // Queue for offline delivery
        this.queueNotification(userId, enriched);
        return {
            success: true,
            queued: true,
            notification: enriched
        };
    }

    // Broadcast notification to multiple users
    notifyUsers(userIds, notification) {
        const results = {
            delivered: [],
            queued: [],
            failed: []
        };

        userIds.forEach(userId => {
            const result = this.notifyUser(userId, notification);
            if (result.queued) {
                results.queued.push(userId);
            } else if (result.success) {
                results.delivered.push(userId);
            } else {
                results.failed.push(userId);
            }
        });

        return results;
    }

    // Send alert notification
    sendAlert(userId, type, message, priority = 'normal') {
        const alert = {
            id: this.generateNotificationId(),
            type: 'alert',
            alertType: type,
            message,
            priority,
            timestamp: Date.now(),
            read: false
        };

        return this.notifyUser(userId, alert);
    }

    // Send travel recommendation
    sendRecommendation(userId, destination, reason, metadata = {}) {
        const recommendation = {
            id: this.generateNotificationId(),
            type: 'recommendation',
            destination,
            reason,
            metadata,
            timestamp: Date.now(),
            actionRequired: true,
            read: false
        };

        return this.notifyUser(userId, recommendation);
    }

    // Send real-time itinerary update
    sendItineraryUpdate(userId, tripId, update) {
        const notification = {
            id: this.generateNotificationId(),
            type: 'itinerary_update',
            tripId,
            update,
            timestamp: Date.now(),
            read: false
        };

        return this.notifyUser(userId, notification);
    }

    // Send weather alert
    sendWeatherAlert(userId, destination, weatherData) {
        const alert = {
            id: this.generateNotificationId(),
            type: 'weather_alert',
            destination,
            weatherData,
            severity: this.calculateWeatherSeverity(weatherData),
            timestamp: Date.now(),
            read: false
        };

        return this.notifyUser(userId, alert);
    }

    // Send safety notice
    sendSafetyNotice(userId, destination, noticeType, details) {
        const notice = {
            id: this.generateNotificationId(),
            type: 'safety_notice',
            destination,
            noticeType, // advisory, warning, emergency
            details,
            priority: 'high',
            timestamp: Date.now(),
            read: false,
            actionRequired: noticeType !== 'advisory'
        };

        return this.notifyUser(userId, notice);
    }

    // Send price drop notification
    sendPriceAlert(userId, destination, originalPrice, newPrice, savings) {
        const notification = {
            id: this.generateNotificationId(),
            type: 'price_alert',
            destination,
            originalPrice,
            newPrice,
            savings: Math.round((savings / originalPrice) * 100),
            timestamp: Date.now(),
            read: false,
            actionRequired: true
        };

        return this.notifyUser(userId, notification);
    }

    // Enrich notification with metadata
    enrichNotification(notification, userId) {
        return {
            ...notification,
            userId,
            id: notification.id || this.generateNotificationId(),
            timestamp: notification.timestamp || Date.now(),
            read: notification.read || false,
            deliveredAt: Date.now()
        };
    }

    // Queue notification for offline users
    queueNotification(userId, notification) {
        if (!this.notificationHistory.has(userId)) {
            this.notificationHistory.set(userId, []);
        }

        this.notificationHistory.get(userId).push(notification);
        this.notificationQueue.push({ userId, notification });

        // Keep only last 50 notifications per user
        const history = this.notificationHistory.get(userId);
        if (history.length > 50) {
            history.shift();
        }
    }

    // Get pending notifications for user
    getPendingNotifications(userId, limit = 20) {
        const history = this.notificationHistory.get(userId) || [];
        return history.slice(-limit).reverse();
    }

    // Mark notification as read
    markAsRead(userId, notificationId) {
        const history = this.notificationHistory.get(userId) || [];
        const notification = history.find(n => n.id === notificationId);
        
        if (notification) {
            notification.read = true;
            notification.readAt = Date.now();
            return true;
        }
        
        return false;
    }

    // Mark all notifications as read
    markAllAsRead(userId) {
        const history = this.notificationHistory.get(userId) || [];
        history.forEach(n => {
            n.read = true;
            n.readAt = Date.now();
        });
    }

    // Delete notification
    deleteNotification(userId, notificationId) {
        const history = this.notificationHistory.get(userId) || [];
        const index = history.findIndex(n => n.id === notificationId);
        
        if (index > -1) {
            history.splice(index, 1);
            return true;
        }
        
        return false;
    }

    // Set notification preferences
    setPreferences(userId, preferences) {
        this.preferences.set(userId, {
            ...this.preferences.get(userId),
            ...preferences,
            updatedAt: Date.now()
        });
    }

    // Get notification preferences
    getPreferences(userId) {
        return this.preferences.get(userId) || {
            alerts: true,
            recommendations: true,
            weather: true,
            safety: true,
            priceAlerts: true,
            updatedAt: Date.now()
        };
    }

    // Calculate weather severity
    calculateWeatherSeverity(weatherData) {
        if (weatherData.temperature > 45 || weatherData.temperature < 0) return 'critical';
        if (weatherData.rainfall > 100 || weatherData.windSpeed > 80) return 'high';
        if (weatherData.rainfall > 50 || weatherData.windSpeed > 50) return 'medium';
        return 'low';
    }

    // Broadcast to all subscribers of a user (connected sockets)
    broadcast(userId, event, data) {
        if (this.subscribers.has(userId)) {
            return {
                event,
                data,
                sentTo: this.subscribers.get(userId).size
            };
        }
        return { event, data, sentTo: 0 };
    }

    // Generate unique notification ID
    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get notification statistics
    getStats() {
        return {
            totalSubscribers: this.subscribers.size,
            totalConnections: Array.from(this.subscribers.values())
                .reduce((sum, set) => sum + set.size, 0),
            queuedNotifications: this.notificationQueue.length,
            usersWithHistory: this.notificationHistory.size
        };
    }

    // Cleanup old notifications (>7 days)
    cleanupOldNotifications(daysOld = 7) {
        const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
        let cleaned = 0;

        for (const [userId, notifications] of this.notificationHistory.entries()) {
            const filtered = notifications.filter(n => n.timestamp > cutoffTime);
            if (filtered.length !== notifications.length) {
                this.notificationHistory.set(userId, filtered);
                cleaned += notifications.length - filtered.length;
            }
        }

        return cleaned;
    }
}

export default new NotificationService();
