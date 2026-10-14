# Quick Start Guide - Advanced TravelAI Features

## Installation & Setup

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Setup

Create `.env` file in backend:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 3. Start Development Server

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Quick Usage Examples

### Backend - ML Recommendations

```javascript
import recommendationEngine from './services/recommendationEngine.js';

// Build user profile from travel history
const profile = recommendationEngine.buildUserProfile('user123', [
    {
        destination: 'Goa',
        interests: ['beaches', 'nightlife'],
        budget: 20000,
        duration: 5
    }
]);

// Get personalized recommendations
const recs = recommendationEngine.getHybridRecommendations(
    'user123',
    [{ destination: 'Goa', interests: ['beaches'] }],
    { interests: ['adventure', 'nature'], budget: 30000 },
    5 // top 5 recommendations
);

console.log(recs);
// Returns: [
//   {
//     destination: 'Kerala',
//     finalScore: 85,
//     collaborativeScore: 80,
//     contentScore: 92,
//     reasons: [...]
//   }
// ]
```

### Backend - Risk Assessment

```javascript
import mlRiskScorer from './services/mlRiskScorer.js';

// Comprehensive risk assessment
const assessment = mlRiskScorer.assessComprehensiveRisk(
    'Varanasi',
    '2026-09-15',
    { age: 35, healthConditions: [], travelExperience: 'experienced' }
);

console.log(assessment);
// Returns: {
//   overallRisk: 45,
//   riskLevel: 'MEDIUM',
//   breakdown: {
//     weather: 40,
//     crowd: 60,
//     security: 50,
//     health: 35,
//     infrastructure: 40
//   },
//   recommendations: [...],
//   alerts: [...],
//   safeToTravel: true
// }
```

### Frontend - Use Recommendations Hook

```jsx
import { useRecommendations } from '../hooks/useAdvanced.jsx';

export default function DestinationList() {
    const { recommendations, loading, error, fetchRecommendations } = useRecommendations();

    useEffect(() => {
        fetchRecommendations({
            interests: ['heritage', 'food'],
            budget: 50000
        }, 5);
    }, []);

    if (loading) return <div>Loading recommendations...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {recommendations.map(rec => (
                <div key={rec.destination}>
                    <h3>{rec.destination}</h3>
                    <p>Score: {rec.score}%</p>
                    <p>Confidence: {rec.confidence}%</p>
                </div>
            ))}
        </div>
    );
}
```

### Frontend - Risk Assessment

```jsx
import { useRiskAssessment } from '../hooks/useAdvanced.jsx';

export default function SafetyCheck() {
    const { risk, loading, assessRisk } = useRiskAssessment();

    const handleCheck = async () => {
        await assessRisk('Goa', new Date(), { age: 30 });
    };

    return (
        <div>
            <button onClick={handleCheck}>Check Risk</button>
            {risk && (
                <div>
                    <h3>Overall Risk: {risk.overallRisk}/100 ({risk.riskLevel})</h3>
                    <p>Safe to travel: {risk.safeToTravel ? 'Yes' : 'No'}</p>
                    <ul>
                        {risk.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
```

### Frontend - Itinerary Optimization

```jsx
import { useItineraryOptimization } from '../hooks/useAdvanced.jsx';

export default function TripOptimizer() {
    const { optimized, metrics, optimize } = useItineraryOptimization();

    const handleOptimize = async () => {
        await optimize(
            'Jaipur',
            3,
            30000,
            ['heritage', 'culture'],
            [] // activities list
        );
    };

    return (
        <div>
            <button onClick={handleOptimize}>Optimize Trip</button>
            {metrics && (
                <div>
                    <p>Total Cost: ₹{metrics.totalCost}</p>
                    <p>Activities: {metrics.activityCount}</p>
                    <p>Efficiency: {metrics.efficiency} activities/hour</p>
                </div>
            )}
        </div>
    );
}
```

### Frontend - Real-time Notifications

```jsx
import { useNotifications } from '../hooks/useAdvanced.jsx';

export default function NotificationCenter() {
    const { notifications, addNotification } = useNotifications();

    return (
        <div>
            <h2>Notifications ({notifications.length})</h2>
            {notifications.map(notif => (
                <div key={notif.id} className={notif.type}>
                    <h4>{notif.message}</h4>
                    <p>{new Date(notif.timestamp).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
}
```

### Frontend - Performance Monitoring

```javascript
import {
    cache,
    OfflineSupport,
    PerformanceMonitor,
    initializePerformanceOptimizations
} from '../utils/performanceOptimizations.js';

// Initialize all optimizations
const perf = initializePerformanceOptimizations();

// Use cache
async function cacheDestinations(destinations) {
    for (const dest of destinations) {
        await cache.set(`dest_${dest.id}`, dest, 3600000);
    }
}

// Check offline
if (OfflineSupport.isOnline()) {
    console.log('App is online');
} else {
    console.log('App is offline - using cached data');
}

// Listen for online/offline events
OfflineSupport.onOnline(() => console.log('Back online!'));
OfflineSupport.onOffline(() => console.log('Now offline'));
```

## API Endpoints Reference

### Recommendations
```
GET /api/advanced/recommendations?interests=heritage,food&budget=50000&limit=5
GET /api/advanced/trending?days=7
GET /api/advanced/content-recommendations?interests=adventure&limit=5
POST /api/advanced/interaction
```

### Risk Assessment
```
POST /api/advanced/risk-assessment
```

### Optimization
```
POST /api/advanced/optimize-itinerary
```

### Analytics
```
GET /api/advanced/analytics
```

## Real-time WebSocket Events

### Client to Server
```javascript
socket.emit('register-user', userId);
socket.emit('get-recommendations', { userId, preferences, userTravels });
socket.emit('assess-risk', { destination, date, userProfile });
socket.emit('optimize-itinerary', { destination, days, budget, interests });
```

### Server to Client
```javascript
socket.on('recommendations', (data) => { /* Handle */ });
socket.on('risk-assessment', (data) => { /* Handle */ });
socket.on('itinerary-optimized', (data) => { /* Handle */ });
socket.on('notification', (data) => { /* Handle */ });
```

## Caching Strategies

### Backend Caching
```javascript
import advancedCache from './services/advancedCache.js';

// Cache recommendations for 1 hour
advancedCache.set(`recs_user123`, recommendations, 3600000);

// Retrieve with auto-expiration
const cached = advancedCache.get(`recs_user123`);

// Memoize expensive operations
const result = advancedCache.memo('risk_goa', () => {
    return mlRiskScorer.assessComprehensiveRisk('Goa', ...);
});
```

### Frontend Caching
```javascript
import { cache } from '../utils/performanceOptimizations.js';

// Store data offline
await cache.set('destinations', destinationData, 86400000); // 24 hours

// Retrieve
const cached = await cache.get('destinations');

// Clear
await cache.delete('destinations');
```

## State Management Example

```javascript
import store from '../store/store.js';
import { recommendationsSlice } from '../store/store.js';

// Dispatch action
store.dispatch(
    recommendationsSlice.actions.fetchSuccess([
        { destination: 'Goa', score: 85 },
        { destination: 'Kerala', score: 92 }
    ])
);

// Subscribe to changes
const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    console.log('New recommendations:', state.recommendations.items);
});
```

## Performance Debugging

### Enable Performance Monitoring
```javascript
const perfMonitor = new PerformanceMonitor();

perfMonitor.mark('api-call-start');
// ... make API call
perfMonitor.mark('api-call-end');
perfMonitor.measure('api-call', 'api-call-start', 'api-call-end');

perfMonitor.logMetrics();
```

### Check Memory Usage
```javascript
import { MemoryLeakDetector } from '../utils/performanceOptimizations.js';

const memory = await MemoryLeakDetector.checkMemory();
console.log(memory);
// { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit, ratio }
```

## Troubleshooting

### Recommendations not loading?
1. Check network tab for `/api/advanced/recommendations` request
2. Verify auth token is sent in headers
3. Check browser console for errors
4. Verify backend is running

### Risk assessment taking too long?
1. Check if results are cached
2. Enable MemoryLeakDetector to check resource usage
3. Review performance metrics

### WebSocket disconnecting?
1. Check firewall settings
2. Verify Socket.IO is properly configured
3. Check for CORS issues in browser console
4. Verify backend is handling WebSocket connections

### High memory usage?
1. Clear IndexedDB cache: `await cache.clear()`
2. Enable service worker: Check Application tab in DevTools
3. Monitor with MemoryLeakDetector

## Next Steps

1. **Connect Real Database**: Replace mock services with PostgreSQL/MongoDB
2. **Add Payment Gateway**: Integrate Stripe/PayPal for bookings
3. **Deploy**: Use Docker and deploy to AWS/GCP/Azure
4. **Monitor**: Set up application monitoring with Datadog/New Relic
5. **Scale**: Implement caching layers (Redis) and load balancing

## Support & Documentation

- **API Documentation**: See `docs/API.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Advanced Features**: See `docs/ADVANCED_FEATURES.md`
- **Demo Script**: See `docs/SIH_DEMO_SCRIPT.md`

## Key Files Structure

```
backend/
├── src/
│   ├── server.js                    # Main server setup with new services
│   ├── services/
│   │   ├── recommendationEngine.js  # ML recommendations
│   │   ├── mlRiskScorer.js         # ML risk assessment
│   │   ├── advancedCache.js        # Caching layer
│   │   ├── notificationService.js  # Real-time notifications
│   │   └── itineraryOptimizer.js   # Route optimization
│   ├── middleware/
│   │   ├── validation.js           # Input validation
│   │   └── securityEnhancements.js # Security middleware
│   ├── routes/
│   │   └── advanced.js             # Advanced API endpoints
│   └── models/
│       └── database.js             # Database schemas

frontend/
├── src/
│   ├── store/
│   │   └── store.js               # Redux store
│   ├── hooks/
│   │   └── useAdvanced.jsx        # Custom React hooks
│   ├── components/
│   │   └── AnalyticsDashboard.jsx # Advanced visualizations
│   └── utils/
│       └── performanceOptimizations.js # Performance utilities
└── public/
    └── sw.js                       # Service worker
```

Happy coding! 🚀
