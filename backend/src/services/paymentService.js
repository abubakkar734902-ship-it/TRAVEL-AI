// Payment Integration Service
// Supports Stripe and PayPal

import axios from 'axios';

// ========== STRIPE PAYMENT SERVICE ==========

export class StripePaymentService {
    constructor(secretKey) {
        this.secretKey = secretKey;
        this.baseURL = 'https://api.stripe.com/v1';
        this.client = axios.create({
            baseURL: this.baseURL,
            auth: {
                username: secretKey,
                password: ''
            }
        });
    }

    /**
     * Create a payment intent
     */
    async createPaymentIntent(amount, currency = 'inr', metadata = {}) {
        try {
            const response = await this.client.post('/payment_intents', {
                amount: Math.round(amount * 100), // Convert to cents
                currency: currency.toLowerCase(),
                metadata: metadata
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create payment intent: ${error.message}`);
        }
    }

    /**
     * Confirm payment
     */
    async confirmPayment(paymentIntentId, paymentMethod) {
        try {
            const response = await this.client.post(
                `/payment_intents/${paymentIntentId}/confirm`,
                { payment_method: paymentMethod }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Failed to confirm payment: ${error.message}`);
        }
    }

    /**
     * Create a charge (legacy method, not recommended for new implementations)
     */
    async createCharge(amount, currency, source, description, metadata = {}) {
        try {
            const response = await this.client.post('/charges', {
                amount: Math.round(amount * 100),
                currency: currency.toLowerCase(),
                source: source,
                description: description,
                metadata: metadata
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create charge: ${error.message}`);
        }
    }

    /**
     * Retrieve payment intent
     */
    async getPaymentIntent(paymentIntentId) {
        try {
            const response = await this.client.get(`/payment_intents/${paymentIntentId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to retrieve payment intent: ${error.message}`);
        }
    }

    /**
     * Create a refund
     */
    async createRefund(chargeId, amount = null, reason = 'requested_by_customer') {
        try {
            const data = {
                charge: chargeId,
                reason: reason
            };
            if (amount) data.amount = Math.round(amount * 100);

            const response = await this.client.post('/refunds', data);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create refund: ${error.message}`);
        }
    }

    /**
     * Create a customer
     */
    async createCustomer(email, name, metadata = {}) {
        try {
            const response = await this.client.post('/customers', {
                email: email,
                name: name,
                metadata: metadata
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create customer: ${error.message}`);
        }
    }

    /**
     * Create a subscription
     */
    async createSubscription(customerId, priceId, metadata = {}) {
        try {
            const response = await this.client.post('/subscriptions', {
                customer: customerId,
                items: [{ price: priceId }],
                metadata: metadata
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create subscription: ${error.message}`);
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, signature, secret) {
        const crypto = require('crypto');
        const hash = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        return hash === signature;
    }
}

// ========== PAYPAL PAYMENT SERVICE ==========

export class PayPalPaymentService {
    constructor(clientId, secret, mode = 'sandbox') {
        this.clientId = clientId;
        this.secret = secret;
        this.mode = mode;
        this.baseURL = mode === 'production'
            ? 'https://api.paypal.com/v2'
            : 'https://api.sandbox.paypal.com/v2';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Get access token
     */
    async getAccessToken() {
        try {
            // Check if token is still valid
            if (this.accessToken && this.tokenExpiry > Date.now()) {
                return this.accessToken;
            }

            const auth = Buffer.from(`${this.clientId}:${this.secret}`).toString('base64');
            const response = await axios.post(
                `${this.baseURL.replace('/v2', '/v1')}/oauth2/token`,
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            return this.accessToken;
        } catch (error) {
            throw new Error(`Failed to get PayPal access token: ${error.message}`);
        }
    }

    /**
     * Create order
     */
    async createOrder(amount, currency, description, payerEmail, items = []) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.post(
                `${this.baseURL}/checkout/orders`,
                {
                    intent: 'CAPTURE',
                    payer: {
                        email_address: payerEmail
                    },
                    purchase_units: [
                        {
                            reference_id: `order-${Date.now()}`,
                            description: description,
                            amount: {
                                currency_code: currency.toUpperCase(),
                                value: amount.toFixed(2),
                                breakdown: {
                                    item_total: {
                                        currency_code: currency.toUpperCase(),
                                        value: amount.toFixed(2)
                                    }
                                }
                            },
                            items: items.length > 0 ? items : [
                                {
                                    name: description,
                                    quantity: '1',
                                    unit_amount: {
                                        currency_code: currency.toUpperCase(),
                                        value: amount.toFixed(2)
                                    }
                                }
                            ]
                        }
                    ],
                    application_context: {
                        return_url: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/payment/success',
                        cancel_url: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/payment/cancel'
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Failed to create PayPal order: ${error.message}`);
        }
    }

    /**
     * Capture order (finalize payment)
     */
    async captureOrder(orderId) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.post(
                `${this.baseURL}/checkout/orders/${orderId}/capture`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Failed to capture PayPal order: ${error.message}`);
        }
    }

    /**
     * Get order details
     */
    async getOrderDetails(orderId) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(
                `${this.baseURL}/checkout/orders/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Failed to get PayPal order details: ${error.message}`);
        }
    }

    /**
     * Refund captured payment
     */
    async refundPayment(captureId, amount = null, reason = 'REFUND') {
        try {
            const token = await this.getAccessToken();
            const data = { reason_code: reason };
            if (amount) {
                data.amount = {
                    currency_code: 'USD',
                    value: amount.toFixed(2)
                };
            }

            const response = await axios.post(
                `${this.baseURL}/payments/captures/${captureId}/refund`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            throw new Error(`Failed to refund PayPal payment: ${error.message}`);
        }
    }

    /**
     * Verify webhook signature
     */
    async verifyWebhookSignature(webhook_id, event_body, transmission_id, transmission_time, cert_url) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.post(
                `${this.baseURL.replace('/v2', '/v1')}/notifications/verify-webhook-signature`,
                {
                    transmission_id: transmission_id,
                    transmission_time: transmission_time,
                    cert_url: cert_url,
                    auth_algo: 'SHA256withRSA',
                    webhook_id: webhook_id,
                    webhook_event: event_body
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data.verification_status === 'SUCCESS';
        } catch (error) {
            console.error('Failed to verify PayPal webhook:', error.message);
            return false;
        }
    }
}

// ========== UNIFIED PAYMENT SERVICE ==========

export class PaymentService {
    constructor(config = {}) {
        this.stripe = config.stripeSecretKey 
            ? new StripePaymentService(config.stripeSecretKey)
            : null;
        this.paypal = config.paypalClientId && config.paypalSecret
            ? new PayPalPaymentService(config.paypalClientId, config.paypalSecret, config.paypalMode || 'sandbox')
            : null;
        this.preferredProvider = config.preferredProvider || 'stripe';
    }

    /**
     * Process payment with configured providers
     */
    async processPayment(provider, amount, currency, metadata = {}) {
        if (provider === 'stripe' && this.stripe) {
            return await this.stripe.createPaymentIntent(amount, currency, metadata);
        } else if (provider === 'paypal' && this.paypal) {
            return await this.paypal.createOrder(amount, currency, metadata.description, metadata.email);
        } else {
            throw new Error(`Unsupported payment provider: ${provider}`);
        }
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(transactionId, provider) {
        if (provider === 'stripe' && this.stripe) {
            return await this.stripe.getPaymentIntent(transactionId);
        } else if (provider === 'paypal' && this.paypal) {
            return await this.paypal.getOrderDetails(transactionId);
        } else {
            throw new Error(`Unsupported payment provider: ${provider}`);
        }
    }

    /**
     * Refund payment
     */
    async refundPayment(transactionId, provider, amount = null, reason = '') {
        if (provider === 'stripe' && this.stripe) {
            return await this.stripe.createRefund(transactionId, amount, reason || 'requested_by_customer');
        } else if (provider === 'paypal' && this.paypal) {
            return await this.paypal.refundPayment(transactionId, amount, 'REFUND');
        } else {
            throw new Error(`Unsupported payment provider: ${provider}`);
        }
    }

    /**
     * Check if payment is ready
     */
    isPaymentReady(provider) {
        if (provider === 'stripe') return this.stripe !== null;
        if (provider === 'paypal') return this.paypal !== null;
        return false;
    }
}

export default PaymentService;
