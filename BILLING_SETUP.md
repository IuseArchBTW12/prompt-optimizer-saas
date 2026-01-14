# Billing Setup Guide

This guide will help you set up Stripe billing for your PromptFix SaaS.

## Prerequisites

- [Stripe account](https://dashboard.stripe.com/register)
- Clerk account (already configured)
- Convex project (already configured)

## Step 1: Configure Stripe

1. **Create a Stripe account** at https://stripe.com if you haven't already

2. **Get your API keys**:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Copy your **Secret key** (starts with `sk_test_`)
   - Add to `.env.local`:
     ```
     STRIPE_SECRET_KEY=sk_test_your_key_here
     ```

3. **Create Products and Prices**:
   
   **Starter Plan ($12/month)**:
   - Go to https://dashboard.stripe.com/test/products
   - Click "Add product"
   - Name: "PromptFix Starter"
   - Description: "100 optimizations per day"
   - Pricing: $12/month (recurring)
   - Click "Save product"
   - Copy the **Price ID** (starts with `price_`)
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_your_id_here
     ```

   **Pro Plan ($29/month)**:
   - Repeat the above for Pro plan
   - Name: "PromptFix Pro"
   - Description: "Unlimited optimizations"
   - Pricing: $29/month (recurring)
   - Copy the **Price ID**
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_your_id_here
     ```

## Step 2: Configure Webhooks

Stripe needs to notify your app when payments succeed/fail.

### Local Development (using Stripe CLI):

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`):
   - Add to `.env.local`:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
     ```

### Production (Vercel/other hosting):

1. **Get your production URL** (e.g., `https://yourapp.vercel.app`)

2. **Add webhook endpoint in Stripe**:
   - Go to https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://yourapp.vercel.app/api/webhooks/stripe`
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Click "Add endpoint"

3. **Copy the signing secret**:
   - Click on your newly created webhook
   - Reveal and copy the "Signing secret"
   - Add to Vercel environment variables:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_your_prod_secret_here
     ```

## Step 3: Update Environment Variables

Add these to your `.env.local`:

```env
# Stripe Billing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
```

## Step 4: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **In another terminal, start Stripe webhook forwarding**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Test a payment**:
   - Go to http://localhost:3000/pricing
   - Click "Upgrade to Starter" or "Upgrade to Pro"
   - Use Stripe's test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Complete the checkout

4. **Verify the upgrade**:
   - Go to http://localhost:3000/app
   - Your usage limit should reflect your new plan
   - Check Convex dashboard to see the plan was updated

## Step 5: Going to Production

When deploying to production:

1. **Switch to live mode in Stripe**:
   - Get your **live** API keys from https://dashboard.stripe.com/apikeys
   - Create the same products in live mode
   - Update environment variables in Vercel/hosting platform

2. **Update Clerk webhook** (if using):
   - Set production URL in Clerk dashboard

3. **Update Convex** to production:
   ```bash
   npx convex deploy
   ```
   - Update `NEXT_PUBLIC_CONVEX_URL` with production URL

4. **Test with real cards** (start with small amounts!)

## Troubleshooting

### Webhook not receiving events
- Make sure Stripe CLI is running (`stripe listen ...`)
- Check that the webhook secret matches
- Look at Stripe dashboard > Webhooks > Events to see delivery status

### Payment succeeds but plan doesn't update
- Check your server logs for errors
- Verify the Convex mutation is working
- Check that price IDs match in your `.env.local`

### "No such price" error
- Verify your price IDs are correct
- Make sure you're using test mode price IDs in development

## Next Steps

- Add subscription management to `/account` page
- Implement plan downgrade logic
- Add email receipts via Stripe
- Set up usage-based billing if needed

## Support

- Stripe docs: https://stripe.com/docs
- Stripe test cards: https://stripe.com/docs/testing
- Convex docs: https://docs.convex.dev
