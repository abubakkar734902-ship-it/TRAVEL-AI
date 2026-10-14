// Integration Tests for Payment Routes

import request from 'supertest';
import express from 'express';
import paymentRoutes from '../../routes/payments.js';

describe('Payment Routes', () => {
    let app;
    let mockAuth = (req, res, next) => {
        req.user = { id: 'user-123', email: 'test@example.com' };
        next();
    };

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use((req, res, next) => mockAuth(req, res, next));
        app.use('/api/payments', paymentRoutes);
    });

    describe('POST /api/payments/stripe/create-intent', () => {
        test('should create payment intent with valid amount', async () => {
            const response = await request(app)
                .post('/api/payments/stripe/create-intent')
                .send({
                    amount: 100,
                    currency: 'inr',
                    description: 'Hotel booking',
                    bookingId: 'book-123',
                    bookingType: 'hotel'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('clientSecret');
            expect(response.body).toHaveProperty('paymentIntentId');
        });

        test('should return 400 for invalid amount', async () => {
            const response = await request(app)
                .post('/api/payments/stripe/create-intent')
                .send({
                    amount: -50,
                    currency: 'inr'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined();
        });

        test('should return 400 for missing amount', async () => {
            const response = await request(app)
                .post('/api/payments/stripe/create-intent')
                .send({
                    currency: 'inr'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/payments/stripe/confirm', () => {
        test('should confirm payment', async () => {
            const response = await request(app)
                .post('/api/payments/stripe/confirm')
                .send({
                    paymentIntentId: 'pi_123456',
                    paymentMethodId: 'pm_123456'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('status');
        });

        test('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/api/payments/stripe/confirm')
                .send({
                    paymentIntentId: 'pi_123456'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/payments/stripe/:paymentIntentId', () => {
        test('should get payment status', async () => {
            const response = await request(app)
                .get('/api/payments/stripe/pi_123456');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('amount');
            expect(response.body).toHaveProperty('currency');
        });
    });

    describe('POST /api/payments/paypal/create-order', () => {
        test('should create PayPal order', async () => {
            const response = await request(app)
                .post('/api/payments/paypal/create-order')
                .send({
                    amount: 100,
                    currency: 'USD',
                    description: 'Hotel booking',
                    bookingId: 'book-123'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('orderId');
            expect(response.body).toHaveProperty('status');
        });

        test('should return 400 for invalid amount', async () => {
            const response = await request(app)
                .post('/api/payments/paypal/create-order')
                .send({
                    amount: 0,
                    currency: 'USD'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/payments/paypal/capture', () => {
        test('should capture PayPal order', async () => {
            const response = await request(app)
                .post('/api/payments/paypal/capture')
                .send({
                    orderId: 'ord-123456'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('status');
        });

        test('should return 400 for missing orderId', async () => {
            const response = await request(app)
                .post('/api/payments/paypal/capture')
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/payments/refund', () => {
        test('should refund payment', async () => {
            const response = await request(app)
                .post('/api/payments/refund')
                .send({
                    transactionId: 'tr_123456',
                    provider: 'stripe',
                    amount: 50
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty('transactionId');
        });

        test('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/api/payments/refund')
                .send({
                    transactionId: 'tr_123456'
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/payments/methods', () => {
        test('should return available payment methods', async () => {
            const response = await request(app)
                .get('/api/payments/methods');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.methods)).toBe(true);
            expect(response.body).toHaveProperty('total');
        });

        test('should include Stripe if configured', async () => {
            const response = await request(app)
                .get('/api/payments/methods');

            const stripMethod = response.body.methods.find(m => m.name === 'stripe');
            if (process.env.STRIPE_SECRET_KEY) {
                expect(stripMethod).toBeDefined();
                expect(stripMethod.enabled).toBe(true);
            }
        });

        test('should include PayPal if configured', async () => {
            const response = await request(app)
                .get('/api/payments/methods');

            const paypalMethod = response.body.methods.find(m => m.name === 'paypal');
            if (process.env.PAYPAL_CLIENT_ID) {
                expect(paypalMethod).toBeDefined();
                expect(paypalMethod.enabled).toBe(true);
            }
        });
    });
});
