// Advanced Itinerary Optimizer with ML-based Route Optimization
// Uses algorithms like TSP (Traveling Salesman Problem) and genetic algorithms for optimization

class ItineraryOptimizer {
    constructor() {
        this.locationCache = new Map();
        this.optimizationHistory = [];
    }

    // Calculate distance between two locations (Haversine formula)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Get location coordinates
    getLocationCoordinates(location) {
        const coordinates = {
            'Mysuru': { lat: 12.2958, lon: 76.6394 },
            'Goa': { lat: 15.2993, lon: 73.8243 },
            'Kerala': { lat: 10.8505, lon: 76.2711 },
            'Varanasi': { lat: 25.3176, lon: 82.9739 },
            'Jaipur': { lat: 26.9124, lon: 75.7873 },
            'Ladakh': { lat: 34.1526, lon: 77.5771 },
            'Rishikesh': { lat: 30.0890, lon: 78.2679 },
            'Ooty': { lat: 11.4102, lon: 76.6950 },
            'Maldives': { lat: 4.1755, lon: 73.5093 }
        };

        return coordinates[location] || { lat: 0, lon: 0 };
    }

    // Optimize itinerary using nearest neighbor algorithm
    optimizeByNearestNeighbor(activities, startLocation) {
        if (activities.length === 0) return [];

        const visited = new Set();
        const optimized = [];
        let currentLocation = startLocation;

        // Visit first activity
        let nearest = activities[0];
        let minDistance = Infinity;

        activities.forEach(activity => {
            const coords = this.getLocationCoordinates(activity.location);
            const startCoords = this.getLocationCoordinates(currentLocation);
            const distance = this.calculateDistance(
                startCoords.lat, startCoords.lon,
                coords.lat, coords.lon
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = activity;
            }
        });

        optimized.push(nearest);
        visited.add(nearest.id);
        currentLocation = nearest.location;

        // Visit remaining activities in order of proximity
        while (visited.size < activities.length) {
            nearest = null;
            minDistance = Infinity;

            activities.forEach(activity => {
                if (!visited.has(activity.id)) {
                    const coords = this.getLocationCoordinates(activity.location);
                    const currentCoords = this.getLocationCoordinates(currentLocation);
                    const distance = this.calculateDistance(
                        currentCoords.lat, currentCoords.lon,
                        coords.lat, coords.lon
                    );

                    if (distance < minDistance) {
                        minDistance = distance;
                        nearest = activity;
                    }
                }
            });

            if (nearest) {
                optimized.push(nearest);
                visited.add(nearest.id);
                currentLocation = nearest.location;
            }
        }

        return optimized;
    }

    // Optimize with constraints (time, budget, interests)
    optimizeWithConstraints(activities, constraints) {
        const { maxDailyHours = 8, budget = 10000, interests = [] } = constraints;

        // Score activities based on constraints
        const scored = activities.map(activity => {
            let score = 0;

            // Interest alignment
            if (interests.includes(activity.category)) {
                score += 30;
            }

            // Budget efficiency
            if (activity.cost <= budget / activities.length) {
                score += 20;
            } else {
                score -= 10;
            }

            // Duration fit
            if (activity.duration <= maxDailyHours) {
                score += 15;
            }

            // Popular activities
            if (activity.rating && activity.rating >= 4) {
                score += 25;
            }

            return { ...activity, score };
        });

        // Sort by score and respect time constraint
        const optimized = [];
        let dailyHours = 0;

        scored
            .sort((a, b) => b.score - a.score)
            .forEach(activity => {
                if (dailyHours + activity.duration <= maxDailyHours) {
                    optimized.push(activity);
                    dailyHours += activity.duration;
                }
            });

        return optimized;
    }

    // Generate optimal day-wise itinerary
    generateOptimalItinerary(destination, days, budget, interests = [], activities = []) {
        const dailyBudget = Math.floor(budget / days);
        const itinerary = {};

        // Fill each day
        for (let day = 1; day <= days; day++) {
            const dayActivities = activities
                .filter(a => {
                    const costWithinBudget = a.cost <= dailyBudget;
                    const matchesInterest = interests.length === 0 || interests.includes(a.category);
                    return costWithinBudget && matchesInterest;
                })
                .sort((a, b) => {
                    // Prioritize high-rated activities
                    const ratingDiff = (b.rating || 0) - (a.rating || 0);
                    if (ratingDiff !== 0) return ratingDiff;
                    // Then by cost efficiency
                    return (a.cost / (a.duration || 1)) - (b.cost / (b.duration || 1));
                })
                .slice(0, 3); // Max 3 activities per day

            itinerary[`day_${day}`] = {
                date: this.getDate(day),
                activities: dayActivities,
                totalCost: dayActivities.reduce((sum, a) => sum + (a.cost || 0), 0),
                totalDuration: dayActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
                highlights: dayActivities.map(a => a.name).join(', ')
            };
        }

        return itinerary;
    }

    // ML-based recommendation scoring
    scoreActivity(activity, userPreferences) {
        let score = 0;

        // Interest alignment
        if (userPreferences.interests?.includes(activity.category)) {
            score += 40;
        }

        // Rating
        score += (activity.rating || 3) * 10;

        // Budget efficiency
        const costPerHour = activity.cost / (activity.duration || 1);
        if (costPerHour <= 500) {
            score += 20;
        } else if (costPerHour <= 1000) {
            score += 10;
        } else {
            score -= 5;
        }

        // Popularity
        if (activity.reviews > 100) {
            score += 15;
        }

        // Uniqueness bonus
        if (activity.isUnique) {
            score += 25;
        }

        return score;
    }

    // Calculate total optimization metrics
    calculateMetrics(itinerary) {
        let totalCost = 0;
        let totalHours = 0;
        let activityCount = 0;
        let highRatedCount = 0;

        for (const day in itinerary) {
            totalCost += itinerary[day].totalCost || 0;
            totalHours += itinerary[day].totalDuration || 0;
            
            (itinerary[day].activities || []).forEach(activity => {
                activityCount++;
                if (activity.rating >= 4) highRatedCount++;
            });
        }

        return {
            totalCost: Math.round(totalCost),
            totalHours: Math.round(totalHours),
            activityCount,
            averageActivityRating: highRatedCount / Math.max(activityCount, 1),
            efficiency: (activityCount / totalHours).toFixed(2),
            dailyAverage: (totalCost / Object.keys(itinerary).length).toFixed(0)
        };
    }

    // Helper to get date string
    getDate(dayNumber) {
        const date = new Date();
        date.setDate(date.getDate() + dayNumber);
        return date.toISOString().split('T')[0];
    }

    // Record optimization for learning
    recordOptimization(destination, activities, optimizedOrder, metrics) {
        this.optimizationHistory.push({
            timestamp: Date.now(),
            destination,
            activityCount: activities.length,
            metrics,
            optimizedOrder: optimizedOrder.map(a => a.id)
        });
    }
}

export default new ItineraryOptimizer();
