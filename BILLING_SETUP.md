# Billing Setup Guide - Clerk Billing

This guide will help you set up Clerk's native billing for your PromptFix SaaS.

## Prerequisites

- Clerk account (already configured)
- Convex project (already configured)

## Step 1: Enable Clerk Billing

1. **Go to your Clerk Dashboard**
   - Navigate to https://dashboard.clerk.com
   - Select your application

2. **Enable Billing** (Note: Clerk billing may require a paid Clerk plan)
   - Go to "Billing" or "Monetization" section in the sidebar
   - Follow Clerk's setup wizard to connect Stripe
   - Clerk will handle the Stripe integration for you

## Step 2: Create Subscription Plans in Clerk

1. **Create Starter Plan**
   - In Clerk dashboard, create a new subscription plan
   - Name: "Starter"
   - Price: $12/month
   - Add plan metadata: `plan: starter`

2. **Create Pro Plan**
   - Create another subscription plan
   - Name: "Pro"  
   - Price: $29/month
   - Add plan metadata: `plan: pro`

## Step 3: Configure Webhooks

Clerk automatically handles webhooks, but you need to configure your endpoint:

1. **In Clerk Dashboard, go to Webhooks**
   - Click "Add Endpoint"
   - URL: `https://your-domain.com/api/webhooks/clerk` (or `http://localhost:3000/api/webhooks/clerk` for local)
   - Select events:
     - `user.created`
     - `user.updated`
   - Copy the webhook signing secret

2. **Add to environment variables**:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_secret_here
   ```

## Step 4: Update User Profile Settings

In your Clerk dashboard:

1. **Go to User & Authentication → User Profile**
2. **Enable "Billing" section** in the User Profile component
3. Users will now see a "Billing" tab in their account page

## How It Works

### User Flow
1. User visits `/pricing` page
2. Clicks "Upgrade to Starter" or "Upgrade to Pro"
3. Redirected to `/account?upgrade=starter` (or `pro`)
4. Clerk's UserProfile component shows the billing portal
5. User subscribes through Clerk's interface
6. Clerk updates user metadata with plan info
7. Webhook fires to `/api/webhooks/clerk`
8. User plan updated in Convex database

### Technical Flow
```
Pricing Page
    ↓
Redirect to /account
    ↓
Clerk UserProfile (with Billing tab)
    ↓
User Subscribes
    ↓
Clerk Webhook → /api/webhooks/clerk
    ↓
Convex.mutation(updatePlan)
    ↓
User Plan Updated
```

## Environment Variables

You only need:

```env
# Clerk Authentication & Billing
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
```

**Note**: You no longer need Stripe API keys directly - Clerk handles that!

## Testing

### Local Development

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Use Clerk's testing mode** - Clerk provides test cards in their billing portal

3. **Test the flow**:
   - Go to http://localhost:3000/pricing
   - Click "Upgrade" button
   - You'll be redirected to `/account`
   - Look for the billing section in Clerk's UserProfile

### Webhook Testing

For local webhook testing, use Clerk's webhook testing feature:
- In Clerk dashboard → Webhooks → Your endpoint
- Click "Send test event"
- Check your server logs

## Going to Production

1. **Switch Clerk to production mode** in dashboard
2. **Update webhook URL** to your production domain
3. **Verify environment variables** in Vercel
4. **Test with real payments** (start small!)

## Alternative: Direct Billing Link

If Clerk's billing feature isn't available on your plan, you can:
1. Create Stripe Customer Portal links in Clerk's user metadata
2. Or continue using direct Stripe integration (see git history for Stripe implementation)

## Troubleshooting

### "Billing not showing in UserProfile"
- Ensure you've enabled the Billing feature in Clerk dashboard
- Check that your Clerk plan supports monetization features
- Verify the UserProfile has `path` and `routing` props set

### Webhook not triggering
- Verify webhook URL is correct
- Check webhook signing secret matches
- Look at Clerk dashboard → Webhooks → Event Logs

### Plan not updating after subscription
- Check that user metadata includes the `plan` field
- Verify webhook is receiving `user.updated` events
- Check Convex logs for mutation errors

## Support

- Clerk docs: https://clerk.com/docs
- Clerk billing: https://clerk.com/docs/billing
- Convex docs: https://docs.convex.dev
