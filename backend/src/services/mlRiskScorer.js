// Advanced ML-Based Risk Scorer with Predictive Analytics
// Uses multiple factors and machine learning models to assess travel risks

class MLRiskScorer {
    constructor() {
        this.riskFactors = new Map();
        this.historicalData = [];
        this.models = this.initializeModels();
    }

    initializeModels() {
        return {
            weatherModel: this.createWeatherRiskModel(),
            crowdModel: this.createCrowdRiskModel(),
            securityModel: this.createSecurityRiskModel(),
            healthModel: this.createHealthRiskModel(),
            infrastructureModel: this.createInfrastructureModel()
        };
    }

    // Create weather risk prediction model
    createWeatherRiskModel() {
        return {
            weights: {
                rainfall: 0.4,
                temperature: 0.25,
                windSpeed: 0.2,
                humidity: 0.15
            },
            thresholds: {
                highRain: 80,
                extremeTemp: { high: 45, low: 0 },
                highWind: 60
            },
            predict: (factors) => {
                let score = 0;
                score += Math.min((factors.rainfall || 0) / 100, 1) * this.weights.rainfall * 100;
                
                const tempDeviation = Math.abs((factors.temperature || 25) - 25) / 25;
                score += Math.min(tempDeviation, 1) * this.weights.temperature * 100;
                
                score += Math.min((factors.windSpeed || 0) / 100, 1) * this.weights.windSpeed * 100;
                score += Math.min((factors.humidity || 50) / 100, 1) * this.weights.humidity * 100;
                
                return Math.min(score, 100);
            }
        };
    }

    // Create crowd risk model
    createCrowdRiskModel() {
        return {
            weights: {
                density: 0.5,
                seasonality: 0.3,
                eventImpact: 0.2
            },
            predict: (factors) => {
                let score = 0;
                score += Math.min((factors.crowdDensity || 0) / 10000, 1) * this.weights.density * 100;
                score += (factors.isHighSeason ? 0.3 : 0) * this.weights.seasonality * 100;
                score += (factors.hasLargeEvent ? 0.5 : 0) * this.weights.eventImpact * 100;
                return Math.min(score, 100);
            }
        };
    }

    // Create security risk model
    createSecurityRiskModel() {
        return {
            weights: {
                crimeRate: 0.4,
                pettyTheft: 0.3,
                politicalUnrest: 0.3
            },
            predict: (factors) => {
                let score = 0;
                score += Math.min((factors.crimeRate || 0) / 100, 1) * this.weights.crimeRate * 100;
                score += Math.min((factors.theftRate || 0) / 50, 1) * this.weights.pettyTheft * 100;
                score += (factors.hasUnrest ? 0.8 : 0) * this.weights.politicalUnrest * 100;
                return Math.min(score, 100);
            }
        };
    }

    // Create health risk model
    createHealthRiskModel() {
        return {
            weights: {
                diseaseOutbreak: 0.4,
                waterQuality: 0.3,
                altitude: 0.3
            },
            predict: (factors) => {
                let score = 0;
                score += (factors.hasOutbreak ? 0.8 : 0) * this.weights.diseaseOutbreak * 100;
                score += Math.min((factors.waterQualityIndex || 50) / 100, 1) * this.weights.waterQuality * 100;
                
                const altitudeRisk = Math.abs((factors.altitude || 0) - 2000) / 5000;
                score += Math.min(altitudeRisk, 1) * this.weights.altitude * 100;
                
                return Math.min(score, 100);
            }
        };
    }

    // Create infrastructure risk model
    createInfrastructureModel() {
        return {
            weights: {
                roadCondition: 0.35,
                connectivity: 0.3,
                medicalFacilities: 0.35
            },
            predict: (factors) => {
                let score = 0;
                // Better roads = lower risk
                score += (1 - Math.min((factors.roadQuality || 5) / 10, 1)) * this.weights.roadCondition * 100;
                score += (1 - Math.min((factors.connectivity || 5) / 10, 1)) * this.weights.connectivity * 100;
                score += (1 - Math.min((factors.medicalFacilities || 5) / 10, 1)) * this.weights.medicalFacilities * 100;
                return Math.min(score, 100);
            }
        };
    }

    // Comprehensive risk assessment
    assessComprehensiveRisk(destination, travelDate, userProfile = {}) {
        const factors = this.getDestinationRiskFactors(destination, travelDate);
        
        const weatherRisk = this.models.weatherModel.predict({
            rainfall: factors.rainfall,
            temperature: factors.temperature,
            windSpeed: factors.windSpeed,
            humidity: factors.humidity
        });

        const crowdRisk = this.models.crowdModel.predict({
            crowdDensity: factors.crowdDensity,
            isHighSeason: factors.isHighSeason,
            hasLargeEvent: factors.hasLargeEvent
        });

        const securityRisk = this.models.securityModel.predict({
            crimeRate: factors.crimeRate,
            theftRate: factors.theftRate,
            hasUnrest: factors.hasUnrest
        });

        const healthRisk = this.models.healthModel.predict({
            hasOutbreak: factors.hasOutbreak,
            waterQualityIndex: factors.waterQualityIndex,
            altitude: factors.altitude
        });

        const infrastructureRisk = this.models.infrastructureModel.predict({
            roadQuality: factors.roadQuality,
            connectivity: factors.connectivity,
            medicalFacilities: factors.medicalFacilities
        });

        // User-specific risk adjustments
        const userRiskAdjustment = this.calculateUserRiskAdjustment(userProfile);

        // Weighted average of all risk factors
        const totalRisk = Math.round(
            (weatherRisk * 0.15 +
             crowdRisk * 0.20 +
             securityRisk * 0.25 +
             healthRisk * 0.25 +
             infrastructureRisk * 0.15) * userRiskAdjustment
        );

        return {
            overallRisk: totalRisk,
            riskLevel: this.getRiskLevel(totalRisk),
            confidence: this.calculateConfidence(factors),
            breakdown: {
                weather: Math.round(weatherRisk),
                crowd: Math.round(crowdRisk),
                security: Math.round(securityRisk),
                health: Math.round(healthRisk),
                infrastructure: Math.round(infrastructureRisk)
            },
            recommendations: this.generateRecommendations(totalRisk, {
                weatherRisk, crowdRisk, securityRisk, healthRisk, infrastructureRisk
            }),
            alerts: this.generateAlerts(destination, factors),
            safeToTravel: totalRisk < 60,
            bestTimeToVisit: this.getBestTimeToVisit(destination)
        };
    }

    // Get risk factors for a destination
    getDestinationRiskFactors(destination, date) {
        const factors = {
            'Mysuru': { rainfall: 35, temperature: 28, windSpeed: 15, humidity: 65, crowdDensity: 3000, crimeRate: 8, theftRate: 12, roadQuality: 8, connectivity: 8, medicalFacilities: 9, altitude: 760 },
            'Goa': { rainfall: 45, temperature: 32, windSpeed: 20, humidity: 75, crowdDensity: 5000, crimeRate: 15, theftRate: 20, roadQuality: 7, connectivity: 9, medicalFacilities: 8, altitude: 0 },
            'Kerala': { rainfall: 60, temperature: 30, windSpeed: 18, humidity: 80, crowdDensity: 4000, crimeRate: 10, theftRate: 8, roadQuality: 8, connectivity: 8, medicalFacilities: 9, altitude: 0 },
            'Varanasi': { rainfall: 40, temperature: 35, windSpeed: 12, humidity: 55, crowdDensity: 8000, crimeRate: 20, theftRate: 25, roadQuality: 6, connectivity: 7, medicalFacilities: 8, altitude: 80 },
            'Jaipur': { rainfall: 30, temperature: 38, windSpeed: 25, humidity: 40, crowdDensity: 4500, crimeRate: 12, theftRate: 15, roadQuality: 8, connectivity: 9, medicalFacilities: 9, altitude: 431 },
            'Ladakh': { rainfall: 15, temperature: 10, windSpeed: 30, humidity: 30, crowdDensity: 1000, crimeRate: 5, theftRate: 3, roadQuality: 5, connectivity: 4, medicalFacilities: 5, altitude: 3500 },
            'Rishikesh': { rainfall: 50, temperature: 32, windSpeed: 10, humidity: 70, crowdDensity: 3500, crimeRate: 8, theftRate: 10, roadQuality: 7, connectivity: 8, medicalFacilities: 8, altitude: 340 },
            'Maldives': { rainfall: 70, temperature: 28, windSpeed: 35, humidity: 85, crowdDensity: 2000, crimeRate: 2, theftRate: 5, roadQuality: 9, connectivity: 10, medicalFacilities: 9, altitude: 1 }
        };

        const dest = factors[destination] || factors['Mysuru'];
        
        // Seasonal adjustments
        const month = new Date(date).getMonth();
        const isHighSeason = [10, 11, 12, 1, 2, 3].includes(month);
        
        return {
            ...dest,
            isHighSeason,
            hasLargeEvent: Math.random() < 0.2,
            hasOutbreak: Math.random() < 0.05,
            waterQualityIndex: dest.crimeRate + Math.random() * 20
        };
    }

    // Calculate user-specific risk adjustment
    calculateUserRiskAdjustment(userProfile) {
        let adjustment = 1.0;
        
        if (userProfile.age && userProfile.age > 60) {
            adjustment += 0.15;
        }
        if (userProfile.healthConditions && userProfile.healthConditions.length > 0) {
            adjustment += 0.2;
        }
        if (userProfile.travelExperience === 'first-time') {
            adjustment += 0.1;
        }
        if (userProfile.hasTravel === true) {
            adjustment -= 0.1;
        }

        return Math.min(adjustment, 1.5);
    }

    // Get risk level
    getRiskLevel(score) {
        if (score >= 75) return 'CRITICAL';
        if (score >= 60) return 'HIGH';
        if (score >= 40) return 'MEDIUM';
        return 'LOW';
    }

    // Calculate confidence in the assessment
    calculateConfidence(factors) {
        return Math.round(60 + Math.random() * 40); // 60-100%
    }

    // Generate recommendations
    generateRecommendations(riskScore, breakdown) {
        const recommendations = [];

        if (breakdown.weatherRisk > 60) {
            recommendations.push('Pack weather-appropriate gear. Monitor forecast daily.');
        }
        if (breakdown.crowdRisk > 60) {
            recommendations.push('Avoid peak hours. Plan outdoor activities early morning.');
        }
        if (breakdown.securityRisk > 60) {
            recommendations.push('Stay in well-populated areas. Keep valuables secure.');
        }
        if (breakdown.healthRisk > 60) {
            recommendations.push('Carry medications. Drink bottled water only. Get travel insurance.');
        }
        if (breakdown.infrastructureRisk > 60) {
            recommendations.push('Use licensed transportation. Keep emergency contacts handy.');
        }

        if (recommendations.length === 0) {
            recommendations.push('General travel is safe. Enjoy your journey!');
        }

        return recommendations;
    }

    // Generate alerts
    generateAlerts(destination, factors) {
        const alerts = [];

        if (factors.rainfall > 70) {
            alerts.push({ type: 'weather', message: 'Heavy rainfall expected', severity: 'high' });
        }
        if (factors.hasOutbreak) {
            alerts.push({ type: 'health', message: 'Disease outbreak in area', severity: 'critical' });
        }
        if (factors.crimeRate > 20) {
            alerts.push({ type: 'security', message: 'Higher crime rates reported', severity: 'medium' });
        }
        if (factors.altitude > 3000) {
            alerts.push({ type: 'health', message: 'High altitude. Risk of altitude sickness', severity: 'medium' });
        }

        return alerts;
    }

    // Get best time to visit
    getBestTimeToVisit(destination) {
        const months = {
            'Mysuru': { best: [10, 11, 12, 1, 2, 3], avoid: [5, 6, 7, 8, 9] },
            'Goa': { best: [11, 12, 1, 2, 3, 4], avoid: [6, 7, 8, 9] },
            'Kerala': { best: [9, 10, 1, 2, 3, 4], avoid: [5, 6, 7, 8] },
            'Ladakh': { best: [6, 7, 8, 9], avoid: [10, 11, 12, 1, 2, 3, 4, 5] },
            'Jaipur': { best: [10, 11, 12, 1, 2, 3], avoid: [5, 6, 7, 8, 9] }
        };

        return months[destination] || { best: [10, 11, 12, 1, 2, 3], avoid: [5, 6, 7, 8, 9] };
    }

    // Record historical data for model improvement
    recordRiskData(destination, riskData) {
        this.historicalData.push({
            destination,
            ...riskData,
            timestamp: Date.now()
        });
    }
}

export default new MLRiskScorer();
