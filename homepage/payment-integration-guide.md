# Payment Integration Guide for Horror4Ever Subscriptions

## Overview
This guide will help you integrate real payment processing (Stripe or PayPal) to replace the simulated subscription system.

## Current Implementation
The current system uses simulated payments. To go live, you'll need to integrate with a real payment processor.

## Option 1: Stripe Integration (Recommended)

### 1. Set Up Stripe Account
1. Go to https://stripe.com and create an account
2. Complete your business verification
3. Get your API keys from the dashboard

### 2. Install Stripe
```bash
npm install stripe
```

### 3. Update Subscription API
Replace the simulated payment in `api/subscription.js`:

**Current simulated code:**
```javascript
// In production, process payment with Stripe/PayPal
// For now, simulate successful payment
```

**Replace with Stripe integration:**
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create subscription
router.post('/create', checkSubscription, async (req, res) => {
  try {
    const { planId = 'basic', paymentMethodId } = req.body;
    
    if (!subscriptionPlans[planId]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      email: req.user.email, // Get from user data
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }], // Your $5/month price ID
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Save subscription to your database
    const subscriptionData = {
      id: subscription.id,
      userId: req.userId,
      planId,
      status: subscription.status,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      createdAt: new Date().toISOString(),
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: false
    };

    subscriptions.set(req.userId, subscriptionData);

    res.json({
      success: true,
      subscription: subscriptionData,
      plan: subscriptionPlans[planId],
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});
```

### 4. Update Frontend Payment
Update `subscription.html` to handle Stripe payments:

```javascript
// Add Stripe.js
<script src="https://js.stripe.com/v3/"></script>

// Initialize Stripe
const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');

// Handle subscription
async function subscribe() {
  try {
    const button = document.getElementById('subscribeButton');
    button.disabled = true;
    button.textContent = 'Processing...';

    // Create payment method
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement, // Your card element
    });

    if (error) {
      throw new Error(error.message);
    }

    const token = localStorage.getItem('horror4ever_member_token');
    const response = await fetch('/api/subscription/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        planId: 'basic',
        paymentMethodId: paymentMethod.id
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(
        data.clientSecret
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      alert('🎉 Welcome to Horror4Ever Premium! Your subscription is now active.');
      location.reload();
    } else {
      throw new Error('Failed to create subscription');
    }
  } catch (error) {
    console.error('Subscription error:', error);
    showError(error.message);
    document.getElementById('subscribeButton').disabled = false;
    document.getElementById('subscribeButton').textContent = 'Subscribe Now - $5/month';
  }
}
```

## Option 2: PayPal Integration

### 1. Set Up PayPal Business Account
1. Go to https://www.paypal.com/business
2. Create a business account
3. Get your client ID and secret

### 2. Install PayPal SDK
```bash
npm install @paypal/checkout-server-sdk
```

### 3. Update Subscription API
```javascript
const paypal = require('@paypal/checkout-server-sdk');

// Configure PayPal
let environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
let client = new paypal.core.PayPalHttpClient(environment);

// Create subscription
router.post('/create', checkSubscription, async (req, res) => {
  try {
    const { planId = 'basic' } = req.body;
    
    // Create PayPal subscription
    const request = new paypal.subscriptions.SubscriptionsPostRequest();
    request.requestBody({
      plan_id: process.env.PAYPAL_PLAN_ID, // Your $5/month plan ID
      subscriber: {
        name: {
          given_name: req.user.name
        },
        email_address: req.user.email
      },
      application_context: {
        brand_name: "Horror4Ever",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
        },
        return_url: "https://your-domain.com/subscription-success",
        cancel_url: "https://your-domain.com/subscription-cancel"
      }
    });

    const subscription = await client.execute(request);

    // Save subscription data
    const subscriptionData = {
      id: subscription.result.id,
      userId: req.userId,
      planId,
      status: subscription.result.status,
      paypalSubscriptionId: subscription.result.id,
      createdAt: new Date().toISOString(),
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false
    };

    subscriptions.set(req.userId, subscriptionData);

    res.json({
      success: true,
      subscription: subscriptionData,
      plan: subscriptionPlans[planId],
      approvalUrl: subscription.result.links.find(link => link.rel === 'approve').href
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});
```

## Environment Variables
Create a `.env` file in your project root:

```env
# Stripe (if using Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_PRICE_ID=price_your_2_dollar_price_id

# PayPal (if using PayPal)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_PLAN_ID=P-5ML4271244454362XMQIZHI

# Database (if using database)
DATABASE_URL=your_database_connection_string
```

## Webhook Handling
Set up webhooks to handle subscription events:

```javascript
// Webhook for payment processor
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
      // Handle new subscription
      break;
    case 'customer.subscription.updated':
      // Handle subscription updates
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break;
    case 'invoice.payment_failed':
      // Handle failed payments
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
```

## Database Integration
For production, replace the in-memory storage with a database:

```javascript
// Example with PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Save subscription
async function saveSubscription(subscriptionData) {
  const query = `
    INSERT INTO subscriptions (id, user_id, plan_id, status, stripe_customer_id, stripe_subscription_id, created_at, current_period_start, current_period_end, cancel_at_period_end)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO UPDATE SET
      status = $4,
      current_period_start = $8,
      current_period_end = $9,
      cancel_at_period_end = $10
  `;
  
  await pool.query(query, [
    subscriptionData.id,
    subscriptionData.userId,
    subscriptionData.planId,
    subscriptionData.status,
    subscriptionData.stripeCustomerId,
    subscriptionData.stripeSubscriptionId,
    subscriptionData.createdAt,
    subscriptionData.currentPeriodStart,
    subscriptionData.currentPeriodEnd,
    subscriptionData.cancelAtPeriodEnd
  ]);
}
```

## Testing
1. Use test API keys for development
2. Test subscription creation and cancellation
3. Test webhook handling
4. Test payment failures and retries
5. Test subscription renewals

## Security Considerations
1. Never expose secret keys in frontend code
2. Validate all webhook signatures
3. Implement proper error handling
4. Use HTTPS in production
5. Follow PCI compliance guidelines

## Go Live Checklist
- [ ] Complete payment processor verification
- [ ] Set up production API keys
- [ ] Configure webhooks
- [ ] Test all payment flows
- [ ] Set up monitoring and alerts
- [ ] Implement proper error handling
- [ ] Set up customer support process
- [ ] Review legal requirements (terms, privacy policy) 