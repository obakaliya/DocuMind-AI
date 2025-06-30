import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export interface CreateCheckoutSessionParams {
  userId: number;
  userEmail: string;
  userName: string;
}

export const createCheckoutSession = async (params: CreateCheckoutSessionParams) => {
  const { userId, userEmail, userName } = params;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'DocuMind Pro Plan',
            description: 'Unlimited document analysis with advanced AI features',
          },
          unit_amount: 499, // $4.99 in cents
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/dashboard?canceled=true`,
    customer_email: userEmail,
    metadata: {
      userId: userId.toString(),
      userName: userName,
    },
  });

  return session;
};

export const createPortalSession = async (customerId: string) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.APP_URL}/dashboard`,
    });

    return session;
  } catch (error: any) {
    // Check if it's the portal configuration error
    if (error.type === 'StripeInvalidRequestError' && 
        error.message.includes('No configuration provided')) {
      throw new Error('Stripe Customer Portal is not configured. Please contact support or configure the portal in your Stripe dashboard.');
    }
    throw error;
  }
};

export const getSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.retrieve(subscriptionId);
};

export const cancelSubscription = async (subscriptionId: string) => {
  return await stripe.subscriptions.cancel(subscriptionId);
};

export const constructWebhookEvent = (payload: string, signature: string) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}; 