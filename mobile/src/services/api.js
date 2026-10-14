// Mobile App API Service
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add token to all requests
        this.client.interceptors.request.use(
            async config => {
                try {
                    const token = await SecureStore.getItemAsync('auth_token');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (err) {
                    console.error('Error getting auth token:', err);
                }
                return config;
            },
            error => Promise.reject(error)
        );

        // Handle errors
        this.client.interceptors.response.use(
            response => response.data,
            error => {
                if (error.response?.status === 401) {
                    // Token expired - logout user
                    this.logout();
                }
                throw error;
            }
        );
    }

    // ========== AUTH ==========

    async login(email, password) {
        const response = await this.client.post('/auth/login', { email, password });
        if (response.token) {
            await SecureStore.setItemAsync('auth_token', response.token);
        }
        return response;
    }

    async register(userData) {
        const response = await this.client.post('/auth/register', userData);
        if (response.token) {
            await SecureStore.setItemAsync('auth_token', response.token);
        }
        return response;
    }

    async logout() {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_data');
    }

    async verifyEmail(token) {
        return this.client.post('/auth/verify-email', { token });
    }

    // ========== DESTINATIONS ==========

    async getDestinations(filters = {}) {
        return this.client.get('/travel/destinations', { params: filters });
    }

    async getDestinationDetail(destinationId) {
        return this.client.get(`/travel/destinations/${destinationId}`);
    }

    async searchDestinations(query) {
        return this.client.get('/travel/search', { params: { query } });
    }

    async getTrendingDestinations() {
        return this.client.get('/advanced/trending');
    }

    // ========== TRIPS ==========

    async createTrip(tripData) {
        return this.client.post('/trips/create', tripData);
    }

    async getTrips() {
        return this.client.get('/trips');
    }

    async getTripDetail(tripId) {
        return this.client.get(`/trips/${tripId}`);
    }

    async updateTrip(tripId, updates) {
        return this.client.put(`/trips/${tripId}`, updates);
    }

    async deleteTrip(tripId) {
        return this.client.delete(`/trips/${tripId}`);
    }

    // ========== ITINERARY ==========

    async getItinerary(tripId) {
        return this.client.get(`/trips/${tripId}/itinerary`);
    }

    async optimizeItinerary(tripId, constraints) {
        return this.client.post('/advanced/optimize-itinerary', {
            tripId,
            ...constraints
        });
    }

    async addActivity(tripId, activity) {
        return this.client.post(`/trips/${tripId}/activities`, activity);
    }

    async updateActivity(tripId, activityId, updates) {
        return this.client.put(`/trips/${tripId}/activities/${activityId}`, updates);
    }

    async removeActivity(tripId, activityId) {
        return this.client.delete(`/trips/${tripId}/activities/${activityId}`);
    }

    // ========== HOTELS & ACCOMMODATIONS ==========

    async getHotels(destinationId, checkInDate, checkOutDate) {
        return this.client.get('/accommodations/hotels', {
            params: { destinationId, checkInDate, checkOutDate }
        });
    }

    async getHotelDetail(hotelId) {
        return this.client.get(`/accommodations/hotels/${hotelId}`);
    }

    async bookHotel(hotelId, roomId, bookingData) {
        return this.client.post('/accommodations/book-hotel', {
            hotelId,
            roomId,
            ...bookingData
        });
    }

    // ========== BIKE RENTALS ==========

    async getBikeRentals(destinationId) {
        return this.client.get('/rentals/bikes', { params: { destinationId } });
    }

    async getBikeDetail(rentalId) {
        return this.client.get(`/rentals/bikes/${rentalId}`);
    }

    async bookBike(bikeId, rentalData) {
        return this.client.post('/rentals/book-bike', {
            bikeId,
            ...rentalData
        });
    }

    // ========== CAR RENTALS ==========

    async getCarRentals(destinationId) {
        return this.client.get('/rentals/cars', { params: { destinationId } });
    }

    async getCarDetail(rentalId) {
        return this.client.get(`/rentals/cars/${rentalId}`);
    }

    async bookCar(carId, rentalData) {
        return this.client.post('/rentals/book-car', {
            carId,
            ...rentalData
        });
    }

    // ========== RECOMMENDATIONS ==========

    async getRecommendations() {
        return this.client.get('/advanced/recommendations');
    }

    async rateRecommendation(recommendationId, rating) {
        return this.client.post(`/advanced/recommendations/${recommendationId}/rate`, { rating });
    }

    // ========== RISK ASSESSMENT ==========

    async assessRisk(destinationId, travelDate) {
        return this.client.post('/advanced/risk-assessment', {
            destinationId,
            travelDate
        });
    }

    // ========== PAYMENTS ==========

    async createPaymentIntent(amount, bookingType, bookingId) {
        return this.client.post('/payments/stripe/create-intent', {
            amount,
            currency: 'inr',
            bookingType,
            bookingId
        });
    }

    async confirmPayment(paymentIntentId, paymentMethodId) {
        return this.client.post('/payments/stripe/confirm', {
            paymentIntentId,
            paymentMethodId
        });
    }

    async createPayPalOrder(amount, description) {
        return this.client.post('/payments/paypal/create-order', {
            amount,
            currency: 'USD',
            description
        });
    }

    async capturePayPalOrder(orderId) {
        return this.client.post('/payments/paypal/capture', { orderId });
    }

    async getPaymentMethods() {
        return this.client.get('/payments/methods');
    }

    // ========== BOOKINGS ==========

    async getBookings() {
        return this.client.get('/bookings');
    }

    async getBookingDetail(bookingId) {
        return this.client.get(`/bookings/${bookingId}`);
    }

    async cancelBooking(bookingId, reason) {
        return this.client.post(`/bookings/${bookingId}/cancel`, { reason });
    }

    // ========== REVIEWS & FEEDBACK ==========

    async submitReview(entityType, entityId, rating, review) {
        return this.client.post('/reviews/submit', {
            entityType,
            entityId,
            rating,
            review
        });
    }

    async getReviews(entityType, entityId) {
        return this.client.get('/reviews', {
            params: { entityType, entityId }
        });
    }

    // ========== PROFILE ==========

    async getProfile() {
        return this.client.get('/users/profile');
    }

    async updateProfile(updates) {
        return this.client.put('/users/profile', updates);
    }

    async uploadAvatar(imageUri) {
        const formData = new FormData();
        formData.append('avatar', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'avatar.jpg'
        });

        return this.client.post('/users/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    // ========== NOTIFICATIONS ==========

    async getNotifications(limit = 20) {
        return this.client.get('/notifications', { params: { limit } });
    }

    async markNotificationRead(notificationId) {
        return this.client.put(`/notifications/${notificationId}/read`);
    }

    // ========== UTILITIES ==========

    setAuthToken(token) {
        if (token) {
            this.client.defaults.headers.Authorization = `Bearer ${token}`;
        } else {
            delete this.client.defaults.headers.Authorization;
        }
    }

    handleError(error) {
        const message = error.response?.data?.error || error.message || 'An error occurred';
        console.error('API Error:', message);
        return {
            success: false,
            error: message,
            status: error.response?.status
        };
    }
}

export default new ApiService();
