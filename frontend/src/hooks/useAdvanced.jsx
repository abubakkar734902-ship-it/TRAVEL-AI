// Advanced React Hooks for State Management and Data Fetching
// Custom hooks for recommendations, risk assessment, real-time updates

import { useState, useEffect, useCallback, useRef, useContext, createContext } from 'react';
import store from '../store/store.js';

// Store context
const StoreContext = createContext(store);

// Provider component
export function StoreProvider({ children }) {
    return (
        <StoreContext.Provider value={store}>
            {children}
        </StoreContext.Provider>
    );
}

// Hook to access store
export function useStore() {
    return useContext(StoreContext);
}

// Hook to access store state
export function useSelector(selector) {
    const store = useStore();
    const [state, setState] = useState(() => selector(store.getState()));

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setState(selector(store.getState()));
        });
        return unsubscribe;
    }, [store, selector]);

    return state;
}

// Hook to dispatch actions
export function useDispatch() {
    const store = useStore();
    return useCallback((action) => store.dispatch(action), [store]);
}

// Hook for recommendations
export function useRecommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchRecommendations = useCallback(async (preferences = {}, limit = 5) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                interests: preferences.interests?.join(',') || '',
                budget: preferences.budget || 100000,
                limit
            });

            const response = await fetch(`/api/advanced/recommendations?${params}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (!response.ok) throw new Error('Failed to fetch recommendations');
            
            const data = await response.json();
            setRecommendations(data.recommendations);
            return data.recommendations;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { recommendations, loading, error, fetchRecommendations };
}

// Hook for risk assessment
export function useRiskAssessment() {
    const [risk, setRisk] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const assessRisk = useCallback(async (destination, date = null, userProfile = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/advanced/risk-assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ destination, date, userProfile })
            });

            if (!response.ok) throw new Error('Failed to assess risk');
            
            const data = await response.json();
            setRisk(data.assessment);
            return data.assessment;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { risk, loading, error, assessRisk };
}

// Hook for itinerary optimization
export function useItineraryOptimization() {
    const [optimized, setOptimized] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const optimize = useCallback(async (destination, days, budget, interests = [], activities = []) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/advanced/optimize-itinerary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ destination, days, budget, interests, activities })
            });

            if (!response.ok) throw new Error('Failed to optimize itinerary');
            
            const data = await response.json();
            setOptimized(data.optimized);
            setMetrics(data.metrics);
            return { optimized: data.optimized, metrics: data.metrics };
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { optimized, metrics, loading, error, optimize };
}

// Hook for real-time notifications
export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        // Setup WebSocket connection
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId || !token) return;

        // Note: In a real app, this would connect to the actual WebSocket
        // For now, we'll simulate with polling

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/notifications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data.notifications || []);
                }
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(pollInterval);
    }, []);

    const addNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 49)]);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return { notifications, addNotification, removeNotification };
}

// Hook for debounced fetch
export function useDebouncedFetch(url, dependencies = [], delay = 300) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (!response.ok) throw new Error('Fetch failed');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(fetchData, delay);

        return () => clearTimeout(timeoutRef.current);
    }, [url, delay, ...dependencies]);

    return { data, loading, error };
}

// Hook for local caching
export function useCachedFetch(key, fetcher, ttl = 3600000) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const cacheRef = useRef(new Map());

    useEffect(() => {
        const cached = cacheRef.current.get(key);
        
        if (cached && Date.now() - cached.timestamp < ttl) {
            setData(cached.data);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await fetcher();
                cacheRef.current.set(key, { data: result, timestamp: Date.now() });
                setData(result);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [key, fetcher, ttl]);

    return { data, loading };
}

// Hook for infinite scroll/pagination
export function useInfiniteScroll(fetcher, pageSize = 20) {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        
        setLoading(true);
        try {
            const result = await fetcher(page, pageSize);
            setItems(prev => [...prev, ...result.items]);
            setHasMore(result.items.length === pageSize);
            setPage(prev => prev + 1);
        } finally {
            setLoading(false);
        }
    }, [page, fetcher, pageSize, loading, hasMore]);

    return { items, hasMore, loading, loadMore };
}

// Hook for form handling
export function useForm(initialValues, onSubmit) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    }, []);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(values);
        } finally {
            setLoading(false);
        }
    }, [values, onSubmit]);

    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    }, [initialValues]);

    return {
        values,
        errors,
        touched,
        loading,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setValues,
        setErrors
    };
}

// Hook for previous value comparison
export function usePrevious(value) {
    const ref = useRef();
    
    useEffect(() => {
        ref.current = value;
    }, [value]);
    
    return ref.current;
}
