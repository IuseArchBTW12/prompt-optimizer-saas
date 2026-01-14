# Prompt Optimizer SaaS - AI Agent Instructions

## Architecture Overview

This is a Next.js 16 App Router SaaS that optimizes LLM prompts using AI, built with:
- **Database**: Convex (real-time, serverless)
- **Auth**: Clerk (middleware-protected routes)
- **UI**: shadcn/ui + Tailwind CSS (dark mode default)
- **AI**: OpenAI API with rule-based fallback

### Key Design Patterns

**Server/Client Component Split**: Landing page is RSC, main app uses `"use client"` for Convex hooks (`useQuery`, `useMutation`). Always check if a component needs client-side state before adding the directive.

**Data Flow**: Client components → Convex mutations/queries → Real-time updates. Database operations use `useMutation(api.prompts.savePrompt)` and `useQuery(api.prompts.getUsage)`.

**Auth Pattern**: Clerk middleware (src/middleware.ts) auto-protects all routes except static files. Use `const { user } = useUser()` in client components. Routes allow unauthenticated access but limit functionality.

## Critical Developer Workflows

### First-Time Setup (Required)
```bash
# Must run Convex BEFORE starting dev server
npx convex dev  # Terminal 1 (keep running)
npm run dev     # Terminal 2

# Clerk keys required in .env.local:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Database Schema Changes
After editing `convex/schema.ts`, Convex auto-syncs. No manual migrations. Schema uses Convex validators (`v.string()`, `v.object()`) not traditional SQL.

### Adding New Pages
Create under `src/app/[route]/page.tsx`. If using Convex hooks, add `"use client"` directive. Import from `convex/_generated/api` for type safety.

## Project-Specific Conventions

**API Route Pattern** (`src/app/api/optimize/route.ts`):
- Uses Next.js route handlers (not Convex actions)
- OpenAI integration happens server-side
- Returns structured JSON: `{ optimizedPrompt, explanation }`
- Has fallback logic if `OPENAI_API_KEY` missing

**Billing Route Pattern** (`src/app/api/checkout/route.ts`):
- Uses Stripe SDK to create checkout sessions
- Requires authenticated user via Clerk's `auth()`
- Accepts `priceId` from request body
- Returns checkout session URL for redirect
- Metadata includes `userId` for webhook handling

**Webhook Pattern** (`src/app/api/webhooks/stripe/route.ts`):
- Verifies Stripe webhook signatures
- Handles `checkout.session.completed`, `customer.subscription.updated/deleted`
- Uses ConvexHttpClient to update user plans
- Maps price IDs to plan names (free/starter/pro)
- Must be excluded from Clerk middleware (already configured)

**Convex Function Pattern** (`convex/prompts.ts`):
- Exports use `mutation()` or `query()` from `"./_generated/server"`
- Args validated with Convex validators: `args: { userId: v.string() }`
- Indexes defined in schema, queried with `.withIndex("by_user", q => q.eq(...))`
- Usage tracking resets daily via timestamp comparison

**UI Component Pattern**:
- All shadcn components in `src/components/ui/`
- Use `<Card>`, `<Button>`, `<Textarea>` from shadcn, not custom components
- Dark mode via Tailwind classes (bg-zinc-900, border-zinc-800)
- No CSS modules or styled-components

## Known Limitations

**Billing**: Stripe integration complete. Requires manual Stripe dashboard setup (products, webhooks). See BILLING_SETUP.md for configuration steps.

**History Retention**: Free tier shows "7 days" retention in pricing but actual enforcement not implemented.

**API Access**: Mentioned in Pro plan but not yet built.

## Integration Points

**Convex Client Provider** (`src/components/ConvexClientProvider.tsx`): Wraps app in `ConvexProvider`. Don't create multiple providers.

**Clerk Integration**: Uses Clerk v6 SDK. Session management automatic via middleware. No manual token handling needed.

**OpenAI Fallback**: If `process.env.OPENAI_API_KEY` undefined, `optimizePromptFallback()` generates template-based improvements. Not true AI but functional.

## Common Tasks

**Add a Convex Query**:
```typescript
// convex/prompts.ts
export const myQuery = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("prompts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .collect();
  }
});

// Use in component
const data = useQuery(api.prompts.myQuery, { userId: user.id });
```

**Add shadcn Component**:
```bash
npx shadcn@latest add [component-name]
# Auto-adds to src/components/ui/
```

**Deploy**:
1. `npx convex deploy` (production database)
2. Push to GitHub → Auto-deploy on Vercel
3. Add env vars in Vercel dashboard
4. Update `NEXT_PUBLIC_CONVEX_URL` to production URL

---

See README.md for full setup, PROJECT_SUMMARY.md for feature status, START_HERE.md for quick start.
