// Advanced Analytics Dashboard Component
// Features: charts, metrics, real-time data, performance monitoring

import React, { useState, useEffect } from 'react';
import { useRiskAssessment, useRecommendations } from '../hooks/useAdvanced.jsx';

// Simple Chart Component (Line Chart)
function LineChart({ data, label, height = 200 }) {
    const canvasRef = React.useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !data || data.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);

        // Get min and max values
        const values = data.map(d => d.value);
        const max = Math.max(...values);
        const min = Math.min(...values);
        const range = max - min || 1;

        // Calculate step width
        const stepX = (width - 40) / (data.length - 1 || 1);
        const stepY = (height - 40) / range;

        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = 20 + (i * (height - 40) / 5);
            ctx.beginPath();
            ctx.moveTo(30, y);
            ctx.lineTo(width - 10, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = 30 + (index * stepX);
            const y = height - 20 - ((point.value - min) * stepY);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#2196F3';
        data.forEach((point, index) => {
            const x = 30 + (index * stepX);
            const y = height - 20 - ((point.value - min) * stepY);
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw axes
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(30, 20);
        ctx.lineTo(30, height - 20);
        ctx.lineTo(width - 10, height - 20);
        ctx.stroke();

        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        data.forEach((point, index) => {
            const x = 30 + (index * stepX);
            ctx.fillText(point.label || index, x, height - 5);
        });

    }, [data]);

    return (
        <div className="chart-container">
            <h4>{label}</h4>
            <canvas
                ref={canvasRef}
                width={400}
                height={height}
                style={{ border: '1px solid #ddd', borderRadius: '4px' }}
            />
        </div>
    );
}

// Pie Chart Component
function PieChart({ data, label, size = 200 }) {
    const canvasRef = React.useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !data || data.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2 - 20;

        // Clear canvas
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, size, size);

        // Calculate total
        const total = data.reduce((sum, item) => sum + item.value, 0);

        // Colors
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

        // Draw slices
        let currentAngle = -Math.PI / 2;

        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * Math.PI * 2;

            // Draw slice
            ctx.fillStyle = colors[index % colors.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();

            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.round((item.value / total) * 100)}%`, labelX, labelY);

            currentAngle += sliceAngle;
        });

        // Draw legend
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        let legendY = 20;

        data.forEach((item, index) => {
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(size + 10, legendY, 15, 15);
            ctx.fillStyle = '#333';
            ctx.fillText(`${item.label} (${item.value})`, size + 30, legendY + 12);
            legendY += 25;
        });

    }, [data, size]);

    return (
        <div className="chart-container">
            <h4>{label}</h4>
            <canvas
                ref={canvasRef}
                width={size + 150}
                height={size}
                style={{ border: '1px solid #ddd', borderRadius: '4px' }}
            />
        </div>
    );
}

// Analytics Dashboard Component
export default function AnalyticsDashboard() {
    const [metrics, setMetrics] = useState({
        riskScores: [],
        destinationViews: [],
        budgetDistribution: []
    });

    const [selectedDestination, setSelectedDestination] = useState(null);
    const { risk } = useRiskAssessment();
    const { recommendations } = useRecommendations();

    useEffect(() => {
        // Simulate loading analytics data
        setMetrics({
            riskScores: [
                { label: 'Mon', value: 35 },
                { label: 'Tue', value: 42 },
                { label: 'Wed', value: 38 },
                { label: 'Thu', value: 45 },
                { label: 'Fri', value: 50 }
            ],
            destinationViews: [
                { label: 'Mysuru', value: 45 },
                { label: 'Goa', value: 38 },
                { label: 'Kerala', value: 32 },
                { label: 'Varanasi', value: 28 }
            ],
            budgetDistribution: [
                { label: 'Accommodation', value: 35 },
                { label: 'Food', value: 25 },
                { label: 'Transport', value: 20 },
                { label: 'Activities', value: 15 },
                { label: 'Shopping', value: 5 }
            ]
        });
    }, []);

    return (
        <section className="analytics-dashboard">
            <div className="dashboard-header">
                <h2>Travel Analytics Dashboard</h2>
                <p>Real-time insights and metrics</p>
            </div>

            <div className="dashboard-grid">
                {/* Risk Trends */}
                <div className="dashboard-card">
                    <LineChart
                        data={metrics.riskScores}
                        label="Risk Score Trends"
                        height={250}
                    />
                </div>

                {/* Destination Popularity */}
                <div className="dashboard-card">
                    <PieChart
                        data={metrics.destinationViews}
                        label="Top Destinations"
                        size={200}
                    />
                </div>

                {/* Budget Distribution */}
                <div className="dashboard-card">
                    <PieChart
                        data={metrics.budgetDistribution}
                        label="Budget Distribution"
                        size={200}
                    />
                </div>
            </div>

            {/* Risk Breakdown */}
            {risk && (
                <div className="dashboard-card">
                    <h3>Current Risk Assessment</h3>
                    <div className="risk-breakdown">
                        <div className="risk-item">
                            <span>Overall Risk:</span>
                            <strong style={{
                                color: risk.overallRisk > 60 ? '#f44336' :
                                       risk.overallRisk > 40 ? '#ff9800' : '#4caf50'
                            }}>
                                {risk.overallRisk}/100 ({risk.riskLevel})
                            </strong>
                        </div>
                        
                        <div className="risk-metrics">
                            {Object.entries(risk.breakdown).map(([key, value]) => (
                                <div key={key} className="metric-bar">
                                    <label>{key}:</label>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${value}%`,
                                                backgroundColor: value > 60 ? '#f44336' :
                                                               value > 40 ? '#ff9800' : '#4caf50'
                                            }}
                                        ></div>
                                    </div>
                                    <span>{value}%</span>
                                </div>
                            ))}
                        </div>

                        <div className="recommendations">
                            <h4>Recommendations:</h4>
                            <ul>
                                {risk.recommendations.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Recommendations */}
            {recommendations.length > 0 && (
                <div className="dashboard-card">
                    <h3>AI Recommendations</h3>
                    <div className="recommendations-list">
                        {recommendations.slice(0, 5).map((rec, idx) => (
                            <div key={idx} className="recommendation-item">
                                <div className="rec-header">
                                    <h4>{rec.destination}</h4>
                                    <span className="score-badge">{rec.score}%</span>
                                </div>
                                <p className="confidence">Confidence: {rec.confidence}%</p>
                                <ul className="reasons">
                                    {rec.reasons?.map((reason, i) => (
                                        <li key={i}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                .analytics-dashboard {
                    padding: 2rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }

                .dashboard-header {
                    color: white;
                    margin-bottom: 2rem;
                }

                .dashboard-header h2 {
                    margin: 0;
                    font-size: 2.5rem;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                .dashboard-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .chart-container h4 {
                    margin: 0 0 1rem 0;
                    color: #333;
                }

                .risk-breakdown {
                    margin-top: 1rem;
                }

                .risk-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 1.2rem;
                    margin-bottom: 1.5rem;
                }

                .risk-item strong {
                    font-size: 1.5rem;
                }

                .risk-metrics {
                    margin: 1.5rem 0;
                }

                .metric-bar {
                    display: grid;
                    grid-template-columns: 80px 1fr 40px;
                    gap: 1rem;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .metric-bar label {
                    text-transform: capitalize;
                    font-weight: 500;
                }

                .progress-bar {
                    height: 20px;
                    background: #e0e0e0;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                }

                .recommendations {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e0e0e0;
                }

                .recommendations h4,
                .recommendations ul {
                    margin: 0.5rem 0;
                }

                .recommendations li {
                    margin: 0.5rem 0;
                    padding-left: 1rem;
                }

                .recommendations-list {
                    display: grid;
                    gap: 1rem;
                }

                .recommendation-item {
                    background: #f5f5f5;
                    padding: 1rem;
                    border-radius: 8px;
                    border-left: 4px solid #667eea;
                }

                .rec-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .rec-header h4 {
                    margin: 0;
                    color: #333;
                }

                .score-badge {
                    background: #667eea;
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: bold;
                }

                .confidence {
                    margin: 0.3rem 0;
                    color: #666;
                    font-size: 0.9rem;
                }

                .reasons {
                    margin: 0.5rem 0 0 0;
                    padding-left: 1.5rem;
                    font-size: 0.9rem;
                    color: #555;
                }

                .reasons li {
                    margin: 0.25rem 0;
                }
            `}</style>
        </section>
    );
}
