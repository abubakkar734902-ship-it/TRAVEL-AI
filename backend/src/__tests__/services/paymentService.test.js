// Unit Tests for Payment Service

import { StripePaymentService, PayPalPaymentService, PaymentService } from '../../services/paymentService.js';
import axios from 'axios';

jest.mock('axios');

describe('StripePaymentService', () => {
    let stripe;

    beforeEach(() => {
        stripe = new StripePaymentService('sk_test_123456');
        jest.clearAllMocks();
    });

    describe('createPaymentIntent', () => {
        test('should create payment intent with valid amount', async () => {
            const mockResponse = {
                data: {
                    id: 'pi_123456',
                    amount: 5000,
                    currency: 'inr',
                    status: 'requires_payment_method',
                    client_secret: 'pi_123456_secret'
                }
            };

            stripe.client.post = jest.fn().mockResolvedValue(mockResponse);

            const result = await stripe.createPaymentIntent(50, 'inr');

            expect(result.id).toBe('pi_123456');
            expect(result.amount).toBe(5000); // 50 * 100 cents
        });

        test('should include metadata in payment intent', async () => {
            const mockResponse = {
                data: {
                    id: 'pi_123456',
                    metadata: { userId: 'user-1', bookingId: 'book-1' }
                }
            };

            stripe.client.post = jest.fn().mockResolvedValue(mockResponse);

            const metadata = { userId: 'user-1', bookingId: 'book-1' };
            const result = await stripe.createPaymentIntent(50, 'inr', metadata);

            expect(result.metadata).toEqual(metadata);
        });

        test('should throw error on invalid amount', async () => {
            stripe.client.post = jest.fn().mockRejectedValue(new Error('Invalid amount'));

            await expect(stripe.createPaymentIntent(-50, 'inr')).rejects.toThrow();
        });
    });

    describe('confirmPayment', () => {
        test('should confirm payment intent', async () => {
            const mockResponse = {
                data: {
                    id: 'pi_123456',
                    status: 'succeeded'
                }
            };

            stripe.client.post = jest.fn().mockResolvedValue(mockResponse);

            const result = await stripe.confirmPayment('pi_123456', 'pm_123456');

            expect(result.status).toBe('succeeded');
        });
    });

    describe('createRefund', () => {
        test('should create full refund', async () => {
            const mockResponse = {
                data: {
                    id: 're_123456',
                    amount: 5000,
                    status: 'succeeded'
                }
            };

            stripe.client.post = jest.fn().mockResolvedValue(mockResponse);

            const result = await stripe.createRefund('ch_123456');

            expect(result.id).toBe('re_123456');
            expect(result.status).toBe('succeeded');
        });

        test('should create partial refund', async () => {
            const mockResponse = {
                data: {
                    id: 're_123456',
                    amount: 2500,
                    status: 'succeeded'
                }
            };

            stripe.client.post = jest.fn().mockResolvedValue(mockResponse);

            const result = await stripe.createRefund('ch_123456', 25);

            expect(result.amount).toBe(2500);
        });
    });
});

describe('PayPalPaymentService', () => {
    let paypal;

    beforeEach(() => {
        paypal = new PayPalPaymentService('client-123', 'secret-123', 'sandbox');
        jest.clearAllMocks();
    });

    describe('getAccessToken', () => {
        test('should retrieve access token', async () => {
            axios.post.mockResolvedValue({
                data: {
                    access_token: 'token-123',
                    expires_in: 3600
                }
            });

            const token = await paypal.getAccessToken();

            expect(token).toBe('token-123');
        });

        test('should cache token until expiry', async () => {
            axios.post.mockResolvedValue({
                data: {
                    access_token: 'token-123',
                    expires_in: 3600
                }
            });

            const token1 = await paypal.getAccessToken();
            const token2 = await paypal.getAccessToken();

            expect(token1).toBe(token2);
            expect(axios.post).toHaveBeenCalledTimes(1); // Only called once
        });
    });

    describe('createOrder', () => {
        test('should create PayPal order', async () => {
            paypal.getAccessToken = jest.fn().mockResolvedValue('token-123');
            axios.post.mockResolvedValue({
                data: {
                    id: 'ord-123456',
                    status: 'CREATED',
                    links: [{ rel: 'approve', href: 'https://www.paypal.com/checkoutnow?token=ord-123456' }]
                }
            });

            const result = await paypal.createOrder(100, 'USD', 'Hotel Booking', 'user@example.com');

            expect(result.id).toBe('ord-123456');
            expect(result.status).toBe('CREATED');
        });
    });

    describe('captureOrder', () => {
        test('should capture PayPal order', async () => {
            paypal.getAccessToken = jest.fn().mockResolvedValue('token-123');
            axios.post.mockResolvedValue({
                data: {
                    id: 'ord-123456',
                    status: 'COMPLETED',
                    payer: { email_address: 'user@example.com' }
                }
            });

            const result = await paypal.captureOrder('ord-123456');

            expect(result.status).toBe('COMPLETED');
        });
    });

    describe('refundPayment', () => {
        test('should refund PayPal payment', async () => {
            paypal.getAccessToken = jest.fn().mockResolvedValue('token-123');
            axios.post.mockResolvedValue({
                data: {
                    id: 'ref-123456',
                    status: 'COMPLETED'
                }
            });

            const result = await paypal.refundPayment('cap-123456', 50);

            expect(result.id).toBe('ref-123456');
        });
    });
});

describe('PaymentService (Unified)', () => {
    let paymentService;

    beforeEach(() => {
        paymentService = new PaymentService({
            stripeSecretKey: 'sk_test_123456',
            paypalClientId: 'client-123',
            paypalSecret: 'secret-123'
        });
    });

    describe('processPayment', () => {
        test('should process Stripe payment', async () => {
            paymentService.stripe.createPaymentIntent = jest.fn().mockResolvedValue({
                id: 'pi_123456',
                status: 'requires_payment_method'
            });

            const result = await paymentService.processPayment('stripe', 100, 'inr', {
                description: 'Test booking',
                email: 'user@example.com'
            });

            expect(result.id).toBe('pi_123456');
        });

        test('should process PayPal payment', async () => {
            paymentService.paypal.createOrder = jest.fn().mockResolvedValue({
                id: 'ord-123456',
                status: 'CREATED'
            });

            const result = await paymentService.processPayment('paypal', 100, 'USD', {
                description: 'Test booking',
                email: 'user@example.com'
            });

            expect(result.id).toBe('ord-123456');
        });

        test('should throw error for unsupported provider', async () => {
            await expect(
                paymentService.processPayment('bitcoin', 100, 'USD', {})
            ).rejects.toThrow('Unsupported payment provider');
        });
    });

    describe('getPaymentMethods', () => {
        test('should return available payment methods', () => {
            const methods = [
                { name: 'stripe', enabled: true },
                { name: 'paypal', enabled: true }
            ];

            expect(paymentService.isPaymentReady('stripe')).toBe(true);
            expect(paymentService.isPaymentReady('paypal')).toBe(true);
        });
    });
});
