# IMPORTANT: Setup Required Before Running

## Critical Steps

### 1. Add Clerk Authentication Keys

Create or edit `.env.local` and add:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Get these from: https://clerk.com (free account)

### 2. Restart Convex to Regenerate Types

The schema has been updated. You MUST restart Convex:

```bash
npx convex dev
```

Keep this running in a separate terminal. It will regenerate the types automatically.

### 3. (Optional) Add OpenAI API Key

For AI-powered optimization, add to `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key
```

Without this, the app will use a rule-based fallback optimizer.

## Quick Start Command Sequence

```bash
# Terminal 1: Start Convex (keep running)
npx convex dev

# Terminal 2: Start Next.js dev server
npm run dev
```

Then open: http://localhost:3000

## Why the Build May Fail Right Now

The TypeScript build error you see is because:
1. Convex needs to regenerate types after schema changes
2. Clerk environment variables are not set

Both will be resolved once you:
1. Add Clerk keys to `.env.local`
2. Run `npx convex dev`

## Full Setup Guide

See README.md for complete documentation.
