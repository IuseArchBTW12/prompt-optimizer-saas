# Clerk Billing - Quick Start Checklist

## ✅ What's Already Done

- [x] Updated pricing page to redirect to Clerk's billing portal
- [x] Configured UserProfile to show billing section
- [x] Created Clerk webhook handler for subscription events
- [x] Integrated with Convex to update user plans
- [x] Updated documentation for Clerk billing

## 🔧 What You Need To Do

### 1. Enable Billing in Clerk (5 minutes)

- [ ] Go to https://dashboard.clerk.com
- [ ] Select your application
- [ ] Navigate to "Billing" or "Monetization" section
- [ ] Follow the setup wizard (Clerk may require a paid plan for billing features)
- [ ] Connect your Stripe account (Clerk handles the integration)

### 2. Create Subscription Plans (5 minutes)

- [ ] In Clerk dashboard, create a new subscription plan:
  - **Starter Plan**:
    - Name: "Starter"
    - Price: $12/month
    - Metadata: Add `plan: starter`
  
- [ ] Create another plan:
  - **Pro Plan**:
    - Name: "Pro"
    - Price: $29/month
    - Metadata: Add `plan: pro`

### 3. Configure Webhooks (2 minutes)

- [ ] In Clerk Dashboard → Webhooks → Add Endpoint
- [ ] URL: `https://your-domain.com/api/webhooks/clerk`
  - For local: `http://localhost:3000/api/webhooks/clerk`
- [ ] Select events: `user.created`, `user.updated`
- [ ] Copy the webhook signing secret
- [ ] Add to `.env.local`:
  ```
  CLERK_WEBHOOK_SECRET=whsec_your_secret_here
  ```

### 4. Enable Billing in User Profile (2 minutes)

- [ ] In Clerk Dashboard → User & Authentication → User Profile
- [ ] Enable the "Billing" section
- [ ] Save changes

### 5. Test It! (2 minutes)

- [ ] Restart your dev server: `npm run dev`
- [ ] Go to http://localhost:3000/pricing
- [ ] Sign in and click "Upgrade to Starter"
- [ ] You should see Clerk's billing portal in the account page
- [ ] Subscribe using test mode
- [ ] Verify plan updated in your app

## 📋 Your `.env.local` Should Look Like:

```env
# Convex (already set up)
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud

# Clerk (already set up)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# NEW: Clerk Webhook
CLERK_WEBHOOK_SECRET=whsec_...

# OpenAI (optional)
OPENAI_API_KEY=sk-...
```

**Note**: You no longer need direct Stripe API keys! Clerk handles all Stripe integration.

## 🚀 Ready for Production?

When you're ready to deploy:
- [ ] Switch Clerk to production mode in dashboard
- [ ] Update webhook URL to production domain
- [ ] Test with real (small) payments first

## 💡 Tips

- **Clerk Dashboard**: Monitor subscriptions in Clerk's billing section
- **Test Mode**: Clerk provides test cards in their billing portal
- **Webhook Events**: Check Clerk dashboard → Webhooks → Event Logs
- **User Metadata**: Plan info is stored in user's `public_metadata.plan`

## ❓ Need Help?

See [BILLING_SETUP.md](./BILLING_SETUP.md) for:
- Detailed step-by-step instructions
- Troubleshooting guide
- Alternative approaches if Clerk billing isn't available

---

**Estimated setup time: ~15 minutes**
**Note**: Clerk's billing feature may require a paid Clerk plan
