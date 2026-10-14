// Payment Routes
// Handles payment processing, webhooks, and transactions

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import PaymentService from '../services/paymentService.js';

const router = express.Router();

// Initialize payment service
const paymentService = new PaymentService({
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
    paypalSecret: process.env.PAYPAL_SECRET,
    paypalMode: process.env.PAYPAL_MODE || 'sandbox'
});

// ========== STRIPE ROUTES ==========

/**
 * Create a Stripe payment intent
 * POST /api/payments/stripe/create-intent
 */
router.post('/stripe/create-intent', authMiddleware, async (req, res) => {
    try {
        const { amount, currency = 'inr', description, bookingId, bookingType } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const metadata = {
            userId: req.user.id,
            bookingId: bookingId,
            bookingType: bookingType, // hotel, bike, car
            description: description
        };

        const paymentIntent = await paymentService.stripe.createPaymentIntent(
            amount,
            currency,
            metadata
        );

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Confirm Stripe payment
 * POST /api/payments/stripe/confirm
 */
router.post('/stripe/confirm', authMiddleware, async (req, res) => {
    try {
        const { paymentIntentId, paymentMethodId } = req.body;

        if (!paymentIntentId || !paymentMethodId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await paymentService.stripe.confirmPayment(
            paymentIntentId,
            paymentMethodId
        );

        if (result.status === 'succeeded') {
            // Update booking status in database
            // await updateBookingStatus(bookingId, 'confirmed', result);
        }

        res.json({
            success: true,
            status: result.status,
            paymentIntentId: result.id,
            message: result.status === 'succeeded' ? 'Payment successful' : 'Payment pending'
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get Stripe payment status
 * GET /api/payments/stripe/:paymentIntentId
 */
router.get('/stripe/:paymentIntentId', authMiddleware, async (req, res) => {
    try {
        const { paymentIntentId } = req.params;

        const paymentIntent = await paymentService.stripe.getPaymentIntent(paymentIntentId);

        res.json({
            success: true,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            metadata: paymentIntent.metadata
        });
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Stripe webhook handler
 * POST /api/payments/stripe/webhook
 */
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        const payload = req.body;

        // Verify signature (implement with actual Stripe webhook secret)
        // const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

        // For now, just parse the event
        const event = JSON.parse(payload);

        switch (event.type) {
            case 'payment_intent.succeeded':
                console.log('Payment succeeded:', event.data.object.id);
                // Update booking in database
                break;
            case 'payment_intent.payment_failed':
                console.log('Payment failed:', event.data.object.id);
                // Update booking status
                break;
            case 'charge.refunded':
                console.log('Charge refunded:', event.data.object.id);
                // Handle refund
                break;
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(400).json({ error: error.message });
    }
});

// ========== PAYPAL ROUTES ==========

/**
 * Create PayPal order
 * POST /api/payments/paypal/create-order
 */
router.post('/paypal/create-order', authMiddleware, async (req, res) => {
    try {
        const { amount, currency = 'USD', description, bookingId, bookingType } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const order = await paymentService.paypal.createOrder(
            amount,
            currency,
            description,
            req.user.email,
            []
        );

        res.json({
            success: true,
            orderId: order.id,
            status: order.status,
            links: order.links
        });
    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Capture PayPal payment
 * POST /api/payments/paypal/capture
 */
router.post('/paypal/capture', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        const result = await paymentService.paypal.captureOrder(orderId);

        if (result.status === 'COMPLETED') {
            // Update booking status in database
            // await updateBookingStatus(bookingId, 'confirmed', result);
        }

        res.json({
            success: true,
            status: result.status,
            orderId: result.id,
            payer: result.payer
        });
    } catch (error) {
        console.error('Error capturing PayPal order:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get PayPal order details
 * GET /api/payments/paypal/:orderId
 */
router.get('/paypal/:orderId', authMiddleware, async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await paymentService.paypal.getOrderDetails(orderId);

        res.json({
            success: true,
            status: order.status,
            orderId: order.id,
            payer: order.payer,
            purchaseUnits: order.purchase_units
        });
    } catch (error) {
        console.error('Error fetching PayPal order:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * PayPal webhook handler
 * POST /api/payments/paypal/webhook
 */
router.post('/paypal/webhook', express.json(), async (req, res) => {
    try {
        const event = req.body;

        switch (event.event_type) {
            case 'CHECKOUT.ORDER.COMPLETED':
                console.log('Order completed:', event.resource.id);
                // Update booking status
                break;
            case 'CHECKOUT.ORDER.APPROVED':
                console.log('Order approved:', event.resource.id);
                // Update booking status
                break;
            case 'PAYMENT.CAPTURE.COMPLETED':
                console.log('Payment captured:', event.resource.id);
                // Handle payment completion
                break;
            case 'PAYMENT.CAPTURE.REFUNDED':
                console.log('Payment refunded:', event.resource.id);
                // Handle refund
                break;
        }

        res.json({ acknowledged: true });
    } catch (error) {
        console.error('PayPal webhook error:', error);
        res.status(400).json({ error: error.message });
    }
});

// ========== UNIVERSAL ROUTES ==========

/**
 * Refund payment
 * POST /api/payments/refund
 */
router.post('/refund', authMiddleware, async (req, res) => {
    try {
        const { transactionId, provider, amount, reason } = req.body;

        if (!transactionId || !provider) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await paymentService.refundPayment(
            transactionId,
            provider,
            amount,
            reason
        );

        res.json({
            success: true,
            status: result.status || result.state,
            transactionId: result.id,
            message: 'Refund processed successfully'
        });
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get payment methods available
 * GET /api/payments/methods
 */
router.get('/methods', (req, res) => {
    const methods = [];
    
    if (paymentService.stripe) {
        methods.push({
            name: 'stripe',
            enabled: true,
            displayName: 'Credit/Debit Card',
            description: 'Pay securely with Stripe'
        });
    }

    if (paymentService.paypal) {
        methods.push({
            name: 'paypal',
            enabled: true,
            displayName: 'PayPal',
            description: 'Pay with your PayPal account'
        });
    }

    res.json({
        success: true,
        methods: methods,
        total: methods.length
    });
});

export default router;
