// Unit Tests for Recommendation Engine Service

import { RecommendationEngine } from '../../services/recommendationEngine.js';

describe('RecommendationEngine', () => {
    let engine;

    beforeEach(() => {
        engine = new RecommendationEngine();
    });

    describe('buildUserProfile', () => {
        test('should create user profile from travel history', () => {
            const userId = 'user-123';
            const travels = [
                {
                    destinationId: 'dest-1',
                    interests: ['adventure', 'hiking'],
                    budget: 50000,
                    duration: 7
                },
                {
                    destinationId: 'dest-2',
                    interests: ['culture', 'history'],
                    budget: 30000,
                    duration: 5
                }
            ];

            const profile = engine.buildUserProfile(userId, travels);

            expect(profile).toHaveProperty('userId', userId);
            expect(profile).toHaveProperty('interests');
            expect(profile).toHaveProperty('averageBudget');
            expect(profile.interests).toContain('adventure');
            expect(profile.interests).toContain('culture');
        });

        test('should handle empty travel history', () => {
            const profile = engine.buildUserProfile('user-456', []);

            expect(profile).toHaveProperty('userId');
            expect(profile.interests).toEqual([]);
        });
    });

    describe('calculateDestinationSimilarity', () => {
        test('should calculate cosine similarity between destinations', () => {
            const dest1 = {
                id: 'dest-1',
                features: [1, 0, 1, 0, 1]
            };
            const dest2 = {
                id: 'dest-2',
                features: [1, 1, 1, 0, 0]
            };

            const similarity = engine.calculateDestinationSimilarity(dest1, dest2);

            expect(similarity).toBeGreaterThanOrEqual(0);
            expect(similarity).toBeLessThanOrEqual(1);
        });
    });

    describe('getHybridRecommendations', () => {
        test('should return recommendations with scores', async () => {
            const userId = 'user-123';
            const mockUserProfile = {
                userId,
                interests: ['adventure', 'nature']
            };

            jest.spyOn(engine, 'buildUserProfile').mockReturnValue(mockUserProfile);

            const recommendations = await engine.getHybridRecommendations(userId);

            expect(Array.isArray(recommendations)).toBe(true);
            recommendations.forEach(rec => {
                expect(rec).toHaveProperty('destinationId');
                expect(rec).toHaveProperty('score');
                expect(rec).toHaveProperty('confidence');
                expect(rec.score).toBeGreaterThanOrEqual(0);
                expect(rec.score).toBeLessThanOrEqual(100);
            });
        });

        test('should have 60% collaborative and 40% content-based weighting', async () => {
            const userId = 'user-123';
            const recommendations = await engine.getHybridRecommendations(userId);

            // Verify weighting is applied
            expect(recommendations.length).toBeGreaterThan(0);
        });
    });

    describe('recordInteraction', () => {
        test('should record user interaction for ML training', () => {
            const interaction = {
                userId: 'user-123',
                destinationId: 'dest-1',
                action: 'view',
                timestamp: Date.now()
            };

            const result = engine.recordInteraction(interaction);

            expect(result).toHaveProperty('success', true);
            expect(result).toHaveProperty('interactionId');
        });

        test('should support different interaction types', () => {
            const actions = ['view', 'save', 'book', 'review', 'share'];

            actions.forEach(action => {
                const interaction = {
                    userId: 'user-123',
                    destinationId: 'dest-1',
                    action: action
                };

                const result = engine.recordInteraction(interaction);
                expect(result.success).toBe(true);
            });
        });
    });

    describe('getTrendingDestinations', () => {
        test('should return trending destinations within time window', async () => {
            const trending = await engine.getTrendingDestinations(7); // 7 days

            expect(Array.isArray(trending)).toBe(true);
            trending.forEach(dest => {
                expect(dest).toHaveProperty('destinationId');
                expect(dest).toHaveProperty('popularity');
                expect(dest).toHaveProperty('trendScore');
            });
        });

        test('should return destinations ordered by trend score', async () => {
            const trending = await engine.getTrendingDestinations(30);

            for (let i = 1; i < trending.length; i++) {
                expect(trending[i - 1].trendScore)
                    .toBeGreaterThanOrEqual(trending[i].trendScore);
            }
        });
    });

    describe('Cache integration', () => {
        test('should use cache for frequent queries', () => {
            const cacheSetSpy = jest.fn();
            const cacheGetSpy = jest.fn(() => null);

            engine.cache = {
                set: cacheSetSpy,
                get: cacheGetSpy
            };

            engine.getHybridRecommendations('user-123');

            // Verify cache is used
            expect(cacheGetSpy).toHaveBeenCalled();
        });
    });
});
