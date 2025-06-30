import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createCheckoutSession as createStripeCheckoutSession, createPortalSession as createStripePortalSession, constructWebhookEvent } from '../services/stripeService';
import pool from '../config/database';

export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Check if user is already on Pro plan
    if (req.user.plan === 'pro') {
      res.status(400).json({ error: 'User is already on Pro plan' });
      return;
    }

    const session = await createStripeCheckoutSession({
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const createPortalSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Get user's Stripe customer ID
    const result = await pool.query(
      'SELECT stripe_customer_id, stripe_subscription_id, subscription_status FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found in database' });
      return;
    }

    const userData = result.rows[0];

    if (!userData.stripe_customer_id) {
      res.status(400).json({ 
        error: 'No active subscription found. Please upgrade to Pro plan first.',
        details: 'User has no Stripe customer ID'
      });
      return;
    }

    if (!userData.stripe_subscription_id) {
      res.status(400).json({ 
        error: 'No active subscription found. Please upgrade to Pro plan first.',
        details: 'User has no Stripe subscription ID'
      });
      return;
    }

    const session = await createStripePortalSession(userData.stripe_customer_id);
    
    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Create portal session error:', error);
    
    // Handle specific portal configuration error
    if (error.message && error.message.includes('Stripe Customer Portal is not configured')) {
      res.status(503).json({ 
        error: 'Billing portal is temporarily unavailable',
        details: 'The billing management system is being configured. Please try again later or contact support.',
        code: 'PORTAL_NOT_CONFIGURED'
      });
      return;
    }
    
    res.status(500).json({ error: 'Failed to create portal session' });
  }
};

export const verifyPaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }

    // Import Stripe to verify session
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil',
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.metadata?.userId === req.user.id.toString()) {
      // Update user plan immediately
      const result = await pool.query(
        `UPDATE users 
         SET plan = 'pro', 
             stripe_customer_id = $1, 
             stripe_subscription_id = $2,
             subscription_status = 'active',
             subscription_end_date = NULL
         WHERE id = $3
         RETURNING id, email, name, plan`,
        [session.customer, session.subscription, req.user.id]
      );

      if (result.rows.length > 0) {
        const updatedUser = result.rows[0];
        res.json({ 
          success: true, 
          message: 'Payment verified and plan updated',
          user: updatedUser
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.status(400).json({ error: 'Invalid session or payment not completed' });
    }
  } catch (error) {
    console.error('Verify payment status error:', error);
    res.status(500).json({ error: 'Failed to verify payment status' });
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    res.status(400).json({ error: 'Missing stripe signature' });
    return;
  }

  try {
    const event = constructWebhookEvent(req.body, sig);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        // Log unhandled events for monitoring
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
};

const handleCheckoutSessionCompleted = async (session: any) => {
  try {
    const userId = session.metadata?.userId;
    if (!userId) {
      console.error('No userId found in session metadata');
      return;
    }

    const result = await pool.query(
      `UPDATE users 
       SET plan = 'pro', 
           stripe_customer_id = $1, 
           stripe_subscription_id = $2,
           subscription_status = 'active',
           subscription_end_date = NULL
       WHERE id = $3
       RETURNING id, email, name, plan`,
      [session.customer, session.subscription, userId]
    );

    if (result.rows.length === 0) {
      console.error(`User ${userId} not found for plan upgrade`);
      return;
    }

    const updatedUser = result.rows[0];
    console.log(`User ${userId} (${updatedUser.email}) successfully upgraded to Pro plan`);
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
  }
};

const handleSubscriptionUpdated = async (subscription: any) => {
  try {
    const customerId = subscription.customer;
    const status = subscription.status;

    if (status === 'active' || status === 'trialing') {
      const result = await pool.query(
        `UPDATE users 
         SET subscription_status = $1
         WHERE stripe_customer_id = $2
         RETURNING id, email`,
        [status, customerId]
      );

      if (result.rows.length > 0) {
        console.log(`Subscription ${subscription.id} status updated to: ${status}`);
      }
    } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
      const result = await pool.query(
        `UPDATE users 
         SET plan = 'free', 
             subscription_status = $1,
             subscription_end_date = NOW()
         WHERE stripe_customer_id = $2
         RETURNING id, email`,
        [status, customerId]
      );

      if (result.rows.length > 0) {
        console.log(`User with customer ID ${customerId} downgraded to free plan due to ${status} status`);
      }
    }
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
  }
};

const handleSubscriptionDeleted = async (subscription: any) => {
  try {
    const customerId = subscription.customer;

    const result = await pool.query(
      `UPDATE users 
       SET plan = 'free', 
           subscription_status = 'canceled',
           subscription_end_date = NOW()
       WHERE stripe_customer_id = $1
       RETURNING id, email`,
      [customerId]
    );

    if (result.rows.length > 0) {
      console.log(`User with customer ID ${customerId} subscription canceled and downgraded to free plan`);
    }
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
  }
};

const handlePaymentFailed = async (invoice: any) => {
  try {
    const customerId = invoice.customer;

    const result = await pool.query(
      `UPDATE users 
       SET subscription_status = 'past_due'
       WHERE stripe_customer_id = $1
       RETURNING id, email`,
      [customerId]
    );

    if (result.rows.length > 0) {
      console.log(`Payment failed for customer ${customerId}, subscription status set to past_due`);
    }
  } catch (error) {
    console.error('Error in handlePaymentFailed:', error);
  }
}; 