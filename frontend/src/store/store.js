// Redux Store Setup using Redux Toolkit pattern
// Manages global state for recommendations, trips, notifications, etc.

// Action types and reducers using slice pattern
const createSlice = (name, initialState, reducers) => {
    return {
        name,
        initialState,
        reducers,
        actions: Object.keys(reducers).reduce((acc, key) => ({
            ...acc,
            [key]: (payload) => ({ type: `${name}/${key}`, payload })
        }), {})
    };
};

// Recommendations Slice
export const recommendationsSlice = createSlice(
    'recommendations',
    {
        items: [],
        loading: false,
        error: null,
        filters: {
            interests: [],
            budget: [0, 100000],
            season: null
        },
        sortBy: 'score' // score, distance, price
    },
    {
        fetchStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchSuccess: (state, action) => {
            state.items = action.payload;
            state.loading = false;
        },
        fetchError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        addToSavedList: (state, action) => {
            if (!state.items.find(item => item.destination === action.payload)) {
                state.items.push(action.payload);
            }
        },
        removeFromSavedList: (state, action) => {
            state.items = state.items.filter(item => item.destination !== action.payload);
        }
    }
);

// Risk Assessment Slice
export const riskSlice = createSlice(
    'risk',
    {
        current: null,
        history: [],
        alerts: [],
        loading: false
    },
    {
        fetchRiskStart: (state) => {
            state.loading = true;
        },
        fetchRiskSuccess: (state, action) => {
            state.current = action.payload;
            state.loading = false;
            state.history.push(action.payload);
        },
        fetchRiskError: (state) => {
            state.loading = false;
        },
        addAlert: (state, action) => {
            state.alerts.push(action.payload);
        },
        clearAlerts: (state) => {
            state.alerts = [];
        }
    }
);

// Itinerary Optimization Slice
export const itinerarySlice = createSlice(
    'itinerary',
    {
        current: null,
        optimized: null,
        metrics: null,
        history: [],
        loading: false,
        autoOptimize: true
    },
    {
        optimizeStart: (state) => {
            state.loading = true;
        },
        optimizeSuccess: (state, action) => {
            state.optimized = action.payload.optimized;
            state.metrics = action.payload.metrics;
            state.loading = false;
        },
        setCurrent: (state, action) => {
            state.current = action.payload;
        },
        toggleAutoOptimize: (state) => {
            state.autoOptimize = !state.autoOptimize;
        }
    }
);

// Real-time Notifications Slice
export const notificationSlice = createSlice(
    'notifications',
    {
        items: [],
        unreadCount: 0,
        preferences: {
            alerts: true,
            recommendations: true,
            weather: true,
            safety: true
        }
    },
    {
        addNotification: (state, action) => {
            state.items.unshift(action.payload);
            if (!action.payload.read) {
                state.unreadCount++;
            }
            // Keep only last 50
            if (state.items.length > 50) {
                state.items.pop();
            }
        },
        markAsRead: (state, action) => {
            const notification = state.items.find(n => n.id === action.payload);
            if (notification && !notification.read) {
                notification.read = true;
                state.unreadCount--;
            }
        },
        markAllAsRead: (state) => {
            state.items.forEach(n => n.read = true);
            state.unreadCount = 0;
        },
        removeNotification: (state, action) => {
            const index = state.items.findIndex(n => n.id === action.payload);
            if (index > -1) {
                if (!state.items[index].read) {
                    state.unreadCount--;
                }
                state.items.splice(index, 1);
            }
        },
        setPreferences: (state, action) => {
            state.preferences = { ...state.preferences, ...action.payload };
        }
    }
);

// User Trips Slice
export const tripsSlice = createSlice(
    'trips',
    {
        items: [],
        current: null,
        loading: false,
        filter: 'all' // all, upcoming, past, completed
    },
    {
        fetchTripsStart: (state) => {
            state.loading = true;
        },
        fetchTripsSuccess: (state, action) => {
            state.items = action.payload;
            state.loading = false;
        },
        setCurrentTrip: (state, action) => {
            state.current = action.payload;
        },
        addTrip: (state, action) => {
            state.items.push(action.payload);
        },
        updateTrip: (state, action) => {
            const index = state.items.findIndex(t => t.id === action.payload.id);
            if (index > -1) {
                state.items[index] = action.payload;
            }
        },
        deleteTrip: (state, action) => {
            state.items = state.items.filter(t => t.id !== action.payload);
        },
        setFilter: (state, action) => {
            state.filter = action.payload;
        }
    }
);

// User Profile Slice
export const userSlice = createSlice(
    'user',
    {
        profile: null,
        preferences: {
            budget: [5000, 100000],
            interests: [],
            travelStyle: 'adventure',
            groupSize: 1
        },
        savedDestinations: [],
        feedbackHistory: [],
        loading: false
    },
    {
        setProfile: (state, action) => {
            state.profile = action.payload;
        },
        updatePreferences: (state, action) => {
            state.preferences = { ...state.preferences, ...action.payload };
        },
        saveDestination: (state, action) => {
            if (!state.savedDestinations.includes(action.payload)) {
                state.savedDestinations.push(action.payload);
            }
        },
        unsaveDestination: (state, action) => {
            state.savedDestinations = state.savedDestinations.filter(d => d !== action.payload);
        },
        addFeedback: (state, action) => {
            state.feedbackHistory.push(action.payload);
        }
    }
);

// Analytics/Cache Slice
export const analyticsSlice = createSlice(
    'analytics',
    {
        cacheStats: null,
        apiMetrics: {
            requestCount: 0,
            avgResponseTime: 0,
            errorRate: 0
        },
        userMetrics: {
            viewedDestinations: 0,
            savedCount: 0,
            bookingCount: 0
        }
    },
    {
        setCacheStats: (state, action) => {
            state.cacheStats = action.payload;
        },
        updateApiMetrics: (state, action) => {
            state.apiMetrics = { ...state.apiMetrics, ...action.payload };
        },
        updateUserMetrics: (state, action) => {
            state.userMetrics = { ...state.userMetrics, ...action.payload };
        }
    }
);

// Redux Reducer Combiner
export const createRootReducer = () => {
    const slices = [
        recommendationsSlice,
        riskSlice,
        itinerarySlice,
        notificationSlice,
        tripsSlice,
        userSlice,
        analyticsSlice
    ];

    return (state = {}, action) => {
        let newState = state;

        slices.forEach(slice => {
            const sliceReducer = (sliceState = slice.initialState, sliceAction) => {
                if (sliceAction.type && sliceAction.type.startsWith(`${slice.name}/`)) {
                    const actionName = sliceAction.type.replace(`${slice.name}/`, '');
                    const reducer = slice.reducers[actionName];
                    if (reducer) {
                        const newSliceState = { ...sliceState };
                        reducer(newSliceState, sliceAction);
                        return newSliceState;
                    }
                }
                return sliceState;
            };

            newState = {
                ...newState,
                [slice.name]: sliceReducer(newState[slice.name], action)
            };
        });

        return newState;
    };
};

// Store configuration
export const configureStore = (preloadedState = {}) => {
    const rootReducer = createRootReducer();

    // Simple store implementation (can be upgraded to Redux for larger apps)
    let state = { ...preloadedState };
    const listeners = new Set();

    return {
        getState: () => state,
        dispatch: (action) => {
            state = rootReducer(state, action);
            listeners.forEach(listener => listener());
            return action;
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        }
    };
};

// Create store instance
const store = configureStore();

export default store;
