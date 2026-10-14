// Advanced ML-Based Recommendation Engine with Collaborative Filtering
// Implements user preference modeling, content-based filtering, and hybrid recommendations

class RecommendationEngine {
    constructor() {
        // Simulated user-item interaction matrix
        this.userProfiles = new Map();
        this.itemFeatures = new Map();
        this.interactionHistory = [];
        this.similarityCache = new Map();
    }

    // Extract user preferences from travel history
    buildUserProfile(userId, travels = []) {
        const profile = {
            userId,
            preferences: {
                budgetRange: [0, 100000],
                destinations: [],
                interests: [],
                seasonPreference: [],
                tripDuration: [],
                pace: 'moderate', // slow, moderate, fast
                groupSize: 1,
                travelStyle: ['adventure'] // adventure, luxury, budget, cultural
            },
            interactionScore: {},
            lastUpdated: Date.now()
        };

        travels.forEach(travel => {
            profile.preferences.destinations.push(travel.destination);
            profile.preferences.interests.push(...(travel.interests || []));
            profile.preferences.budgetRange[0] = Math.min(profile.preferences.budgetRange[0], travel.budget);
            profile.preferences.budgetRange[1] = Math.max(profile.preferences.budgetRange[1], travel.budget);
        });

        this.userProfiles.set(userId, profile);
        return profile;
    }

    // Calculate similarity between two destinations based on multiple factors
    calculateDestinationSimilarity(dest1, dest2) {
        const cacheKey = `${dest1}:${dest2}`;
        if (this.similarityCache.has(cacheKey)) {
            return this.similarityCache.get(cacheKey);
        }

        // Destination feature vectors (expanded for better ML)
        const features = {
            'Mysuru': { climate: 5, heritage: 8, nature: 6, food: 7, budget: 3, crowd: 4 },
            'Goa': { climate: 7, beaches: 9, nightlife: 8, food: 8, budget: 4, crowd: 7 },
            'Ooty': { climate: 7, nature: 9, adventure: 7, heritage: 5, budget: 3, crowd: 5 },
            'Varanasi': { heritage: 10, spirituality: 10, culture: 9, food: 7, budget: 2, crowd: 9 },
            'Jaipur': { heritage: 9, desert: 7, culture: 8, food: 8, budget: 3, crowd: 6 },
            'Kerala': { nature: 9, beaches: 8, backwaters: 9, food: 8, budget: 3, crowd: 4 },
            'Ladakh': { adventure: 10, nature: 10, culture: 7, budget: 4, crowd: 3 },
            'Maldives': { beaches: 10, luxury: 9, water: 10, food: 7, budget: 5, crowd: 5 }
        };

        const f1 = features[dest1] || Object.values(features)[0];
        const f2 = features[dest2] || Object.values(features)[0];

        // Cosine similarity calculation
        let dotProduct = 0;
        let mag1 = 0;
        let mag2 = 0;

        for (const key in f1) {
            dotProduct += (f1[key] || 0) * (f2[key] || 0);
            mag1 += (f1[key] || 0) ** 2;
            mag2 += (f2[key] || 0) ** 2;
        }

        const similarity = dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2) + 0.0001);
        this.similarityCache.set(cacheKey, similarity);
        return similarity;
    }

    // Collaborative filtering: find similar users and their preferences
    collaborativeFilterRecommendations(userId, userTravels, topN = 5) {
        const userProfile = this.userProfiles.get(userId) || this.buildUserProfile(userId, userTravels);

        const allDestinations = [
            'Mysuru', 'Goa', 'Ooty', 'Varanasi', 'Jaipur', 
            'Kerala', 'Ladakh', 'Maldives', 'Rishikesh', 'Pushkar'
        ];

        const recommendations = allDestinations
            .filter(dest => !userProfile.preferences.destinations.includes(dest))
            .map(dest => {
                // Calculate recommendation score
                const similarityScore = userProfile.preferences.destinations
                    .map(visited => this.calculateDestinationSimilarity(visited, dest))
                    .reduce((a, b) => a + b, 0) / Math.max(userProfile.preferences.destinations.length, 1);

                // Interest alignment
                const interestAlignment = this.calculateInterestAlignment(dest, userProfile.preferences.interests);

                // Budget compatibility
                const budgetScore = this.calculateBudgetCompatibility(dest, userProfile.preferences.budgetRange);

                // Combined ML score
                const mlScore = (similarityScore * 0.4) + (interestAlignment * 0.35) + (budgetScore * 0.25);

                return {
                    destination: dest,
                    score: Math.round(mlScore * 100),
                    confidence: Math.round(similarityScore * 100),
                    reasons: [
                        `Similar to your past travels (${Math.round(similarityScore * 100)}%)`,
                        `Matches your interests (${Math.round(interestAlignment * 100)}%)`,
                        `Within budget range (${Math.round(budgetScore * 100)}%)`
                    ]
                };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, topN);

        return recommendations;
    }

    // Content-based filtering: recommend based on item features
    contentBasedRecommendations(preferences, topN = 5) {
        const destinations = [
            { name: 'Mysuru', tags: ['heritage', 'food', 'shopping'] },
            { name: 'Goa', tags: ['beaches', 'nightlife', 'adventure'] },
            { name: 'Kerala', tags: ['nature', 'backwaters', 'food'] },
            { name: 'Varanasi', tags: ['spirituality', 'culture', 'heritage'] },
            { name: 'Jaipur', tags: ['heritage', 'desert', 'culture'] },
            { name: 'Ladakh', tags: ['adventure', 'nature', 'culture'] },
            { name: 'Rishikesh', tags: ['spirituality', 'adventure', 'yoga'] },
            { name: 'Pushkar', tags: ['spirituality', 'culture', 'shopping'] }
        ];

        const recommendations = destinations
            .map(dest => {
                const tagMatches = dest.tags.filter(tag => 
                    preferences.interests?.includes(tag)
                ).length;

                const matchScore = (tagMatches / Math.max(dest.tags.length, 1)) * 100;
                const popularityBoost = Math.random() * 20;

                return {
                    destination: dest.name,
                    contentScore: Math.round(matchScore + popularityBoost),
                    matchedTags: dest.tags.filter(tag => preferences.interests?.includes(tag)),
                    totalTags: dest.tags.length
                };
            })
            .sort((a, b) => b.contentScore - a.contentScore)
            .slice(0, topN);

        return recommendations;
    }

    // Calculate interest alignment score
    calculateInterestAlignment(destination, userInterests = []) {
        const destInterests = {
            'Mysuru': ['heritage', 'food', 'shopping'],
            'Goa': ['beaches', 'nightlife', 'adventure'],
            'Kerala': ['nature', 'backwaters', 'food'],
            'Varanasi': ['spirituality', 'culture', 'heritage'],
            'Jaipur': ['heritage', 'desert', 'culture'],
            'Ladakh': ['adventure', 'nature', 'photography'],
            'Rishikesh': ['spirituality', 'yoga', 'adventure'],
            'Maldives': ['beaches', 'diving', 'luxury']
        };

        const interests = destInterests[destination] || [];
        if (userInterests.length === 0) return 0.5;

        const matches = interests.filter(i => userInterests.includes(i)).length;
        return Math.min(matches / Math.max(userInterests.length, 1), 1);
    }

    // Calculate budget compatibility
    calculateBudgetCompatibility(destination, userBudgetRange) {
        const destCosts = {
            'Mysuru': 15000,
            'Goa': 20000,
            'Kerala': 18000,
            'Varanasi': 12000,
            'Jaipur': 16000,
            'Ladakh': 25000,
            'Rishikesh': 13000,
            'Maldives': 40000
        };

        const destCost = destCosts[destination] || 15000;
        const midBudget = (userBudgetRange[0] + userBudgetRange[1]) / 2;
        const budgetDiff = Math.abs(destCost - midBudget);

        return Math.max(1 - (budgetDiff / midBudget), 0);
    }

    // Hybrid recommendation: combine collaborative and content-based
    getHybridRecommendations(userId, userTravels, preferences, topN = 5) {
        const collaborative = this.collaborativeFilterRecommendations(userId, userTravels, topN);
        const contentBased = this.contentBasedRecommendations(preferences, topN);

        // Merge and weight results
        const merged = new Map();

        collaborative.forEach(rec => {
            merged.set(rec.destination, {
                ...rec,
                collaborativeScore: rec.score,
                contentScore: 0
            });
        });

        contentBased.forEach(rec => {
            if (merged.has(rec.destination)) {
                merged.get(rec.destination).contentScore = rec.contentScore;
            } else {
                merged.set(rec.destination, {
                    destination: rec.destination,
                    collaborativeScore: 0,
                    contentScore: rec.contentScore,
                    confidence: Math.round(rec.contentScore / 2)
                });
            }
        });

        // Calculate final hybrid score (60% collaborative, 40% content-based)
        const final = Array.from(merged.values())
            .map(rec => ({
                ...rec,
                finalScore: Math.round(
                    (rec.collaborativeScore * 0.6) + (rec.contentScore * 0.4)
                )
            }))
            .sort((a, b) => b.finalScore - a.finalScore)
            .slice(0, topN);

        return final;
    }

    // Track user interaction for continuous learning
    recordInteraction(userId, destination, actionType, metadata = {}) {
        this.interactionHistory.push({
            userId,
            destination,
            actionType, // view, book, save, share
            timestamp: Date.now(),
            metadata
        });

        // Update user profile based on interaction
        const profile = this.userProfiles.get(userId);
        if (profile) {
            profile.interactionScore[destination] = (profile.interactionScore[destination] || 0) + 1;
        }
    }

    // Get trending destinations based on user interactions
    getTrendingDestinations(timeWindowDays = 7) {
        const cutoffTime = Date.now() - (timeWindowDays * 24 * 60 * 60 * 1000);
        const recentInteractions = this.interactionHistory.filter(i => i.timestamp > cutoffTime);

        const trends = {};
        recentInteractions.forEach(interaction => {
            const weight = interaction.actionType === 'book' ? 3 : interaction.actionType === 'save' ? 2 : 1;
            trends[interaction.destination] = (trends[interaction.destination] || 0) + weight;
        });

        return Object.entries(trends)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([destination, score]) => ({
                destination,
                trendScore: score,
                trending: true
            }));
    }
}

export default new RecommendationEngine();
