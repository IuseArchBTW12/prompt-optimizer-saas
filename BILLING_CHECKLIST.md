# Stripe Billing - Quick Start Checklist

## ✅ What's Already Done

- [x] Installed Stripe SDK and dependencies
- [x] Created `/api/checkout` endpoint for creating payment sessions
- [x] Created `/api/webhooks/stripe` endpoint for handling subscription events
- [x] Updated pricing page with working upgrade buttons
- [x] Added loading states and error handling
- [x] Created comprehensive setup guide (BILLING_SETUP.md)
- [x] Updated README with billing information

## 🔧 What You Need To Do

### 1. Get Stripe Account and API Keys (5 minutes)

- [ ] Sign up at https://stripe.com (if you don't have an account)
- [ ] Go to https://dashboard.stripe.com/test/apikeys
- [ ] Copy your **Secret key** (starts with `sk_test_`)
- [ ] Add to `.env.local`:
  ```
  STRIPE_SECRET_KEY=sk_test_your_key_here
  ```

### 2. Create Products in Stripe (5 minutes)

- [ ] Go to https://dashboard.stripe.com/test/products
- [ ] Create "PromptFix Starter" product
  - Price: $12/month (recurring)
  - Copy the Price ID (starts with `price_`)
  - Add to `.env.local`: `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...`
- [ ] Create "PromptFix Pro" product
  - Price: $29/month (recurring)
  - Copy the Price ID
  - Add to `.env.local`: `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...`

### 3. Set Up Webhooks for Local Development (2 minutes)

- [ ] Install Stripe CLI:
  ```bash
  brew install stripe/stripe-cli/stripe
  ```
- [ ] Login:
  ```bash
  stripe login
  ```
- [ ] Start webhook forwarding (keep this running):
  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```
- [ ] Copy the webhook secret (starts with `whsec_`)
- [ ] Add to `.env.local`:
  ```
  STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
  ```

### 4. Add App URL (30 seconds)

- [ ] Add to `.env.local`:
  ```
  NEXT_PUBLIC_APP_URL=http://localhost:3000
  ```

### 5. Test It! (2 minutes)

- [ ] Restart your dev server: `npm run dev`
- [ ] In another terminal, run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Go to http://localhost:3000/pricing
- [ ] Click "Upgrade to Starter"
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete checkout
- [ ] Verify your plan updated in the app

## 📋 Your Complete `.env.local` Should Look Like:

```env
# Convex (already set up)
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud

# Clerk (already set up)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenAI (already set up)
OPENAI_API_KEY=sk-...

# NEW: Stripe Billing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...

# NEW: App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Ready for Production?

When you're ready to deploy:
- [ ] Follow the "Going to Production" section in BILLING_SETUP.md
- [ ] Switch to live Stripe keys
- [ ] Set up production webhook endpoint
- [ ] Test with real (small) payments first

## 💡 Tips

- **Stripe Dashboard**: Monitor all payments at https://dashboard.stripe.com
- **Test Cards**: Use `4242 4242 4242 4242` for successful payments
- **Webhook Events**: Check delivery status in Stripe dashboard > Webhooks
- **Logs**: Watch your terminal for webhook events and errors

## ❓ Need Help?

See [BILLING_SETUP.md](./BILLING_SETUP.md) for:
- Detailed step-by-step instructions
- Troubleshooting guide
- Production deployment checklist
- Common issues and solutions

---

**Estimated setup time: ~15 minutes**
