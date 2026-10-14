// Mobile App State Management Store (Zustand)
import React, { createContext, useContext } from 'react';
import create from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

// ========== USER STORE ==========

export const useUserStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            setUser: (user) => set({ user, isAuthenticated: !!user }),
            clearUser: () => set({ user: null, isAuthenticated: false }),

            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.login(email, password);
                    set({ 
                        user: response.user, 
                        isAuthenticated: true,
                        loading: false 
                    });
                    return response;
                } catch (error) {
                    set({ 
                        error: error.message, 
                        loading: false 
                    });
                    throw error;
                }
            },

            register: async (userData) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.register(userData);
                    set({ 
                        user: response.user, 
                        isAuthenticated: true,
                        loading: false 
                    });
                    return response;
                } catch (error) {
                    set({ 
                        error: error.message, 
                        loading: false 
                    });
                    throw error;
                }
            },

            logout: async () => {
                await api.logout();
                set({ user: null, isAuthenticated: false });
            },

            updateProfile: async (updates) => {
                set({ loading: true, error: null });
                try {
                    const response = await api.updateProfile(updates);
                    set({ 
                        user: response.user, 
                        loading: false 
                    });
                    return response;
                } catch (error) {
                    set({ 
                        error: error.message, 
                        loading: false 
                    });
                    throw error;
                }
            }
        }),
        {
            name: 'user-store',
            storage: createJSONStorage(() => AsyncStorage)
        }
    )
);

// ========== TRIPS STORE ==========

export const useTripsStore = create((set, get) => ({
    trips: [],
    currentTrip: null,
    loading: false,
    error: null,

    setTrips: (trips) => set({ trips }),
    setCurrentTrip: (trip) => set({ currentTrip: trip }),

    fetchTrips: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.getTrips();
            set({ trips: response.trips, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    createTrip: async (tripData) => {
        set({ loading: true, error: null });
        try {
            const response = await api.createTrip(tripData);
            const trips = get().trips;
            set({ 
                trips: [...trips, response.trip], 
                currentTrip: response.trip,
                loading: false 
            });
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteTrip: async (tripId) => {
        set({ loading: true, error: null });
        try {
            await api.deleteTrip(tripId);
            const trips = get().trips.filter(t => t.id !== tripId);
            set({ trips, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));

// ========== DESTINATIONS STORE ==========

export const useDestinationsStore = create((set, get) => ({
    destinations: [],
    selectedDestination: null,
    trending: [],
    loading: false,
    error: null,

    fetchDestinations: async (filters) => {
        set({ loading: true, error: null });
        try {
            const response = await api.getDestinations(filters);
            set({ destinations: response.destinations, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchTrending: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.getTrendingDestinations();
            set({ trending: response.destinations, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    selectDestination: async (destinationId) => {
        set({ loading: true, error: null });
        try {
            const response = await api.getDestinationDetail(destinationId);
            set({ selectedDestination: response, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    searchDestinations: async (query) => {
        set({ loading: true, error: null });
        try {
            const response = await api.searchDestinations(query);
            set({ destinations: response.destinations, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    }
}));

// ========== BOOKINGS STORE ==========

export const useBookingsStore = create((set, get) => ({
    bookings: [],
    selectedBooking: null,
    loading: false,
    error: null,

    fetchBookings: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.getBookings();
            set({ bookings: response.bookings, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    selectBooking: async (bookingId) => {
        set({ loading: true, error: null });
        try {
            const response = await api.getBookingDetail(bookingId);
            set({ selectedBooking: response, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    cancelBooking: async (bookingId, reason) => {
        set({ loading: true, error: null });
        try {
            const response = await api.cancelBooking(bookingId, reason);
            // Update bookings list
            const bookings = get().bookings.map(b =>
                b.id === bookingId ? response.booking : b
            );
            set({ bookings, loading: false });
            return response;
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    }
}));

// ========== RECOMMENDATIONS STORE ==========

export const useRecommendationsStore = create((set, get) => ({
    recommendations: [],
    loading: false,
    error: null,

    fetchRecommendations: async () => {
        set({ loading: true, error: null });
        try {
            const response = await api.getRecommendations();
            set({ recommendations: response.recommendations, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    rateRecommendation: async (recommendationId, rating) => {
        try {
            const response = await api.rateRecommendation(recommendationId, rating);
            return response;
        } catch (error) {
            console.error('Error rating recommendation:', error);
            throw error;
        }
    }
}));

// ========== NOTIFICATIONS STORE ==========

export const useNotificationsStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async (limit = 20) => {
        set({ loading: true });
        try {
            const response = await api.getNotifications(limit);
            const unreadCount = response.notifications.filter(n => !n.read).length;
            set({ 
                notifications: response.notifications,
                unreadCount,
                loading: false 
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            set({ loading: false });
        }
    },

    markAsRead: async (notificationId) => {
        try {
            await api.markNotificationRead(notificationId);
            const notifications = get().notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            );
            const unreadCount = notifications.filter(n => !n.read).length;
            set({ notifications, unreadCount });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
}));

// ========== STORE PROVIDER ==========

export function StoreProvider({ children }) {
    return <>{children}</>;
}

// Custom hooks for using stores
export const useUser = () => useUserStore();
export const useTrips = () => useTripsStore();
export const useDestinations = () => useDestinationsStore();
export const useBookings = () => useBookingsStore();
export const useRecommendations = () => useRecommendationsStore();
export const useNotifications = () => useNotificationsStore();
