import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { createCheckoutSession, createPortalSession, handleWebhook, verifyPaymentStatus } from '../controllers/paymentController';

const router = express.Router();

// Payment routes
router.post('/create-checkout-session', authenticateToken, createCheckoutSession);
router.post('/create-portal-session', authenticateToken, createPortalSession);
router.post('/verify-payment-status', authenticateToken, verifyPaymentStatus);

// Webhook endpoint (no auth required)
router.post('/webhook', handleWebhook);

export default router; 