# Prompt Optimizer SaaS

A web-based SaaS application that helps developers optimize prompts for GPT-style LLMs (GPT-4, Claude). Users can paste raw prompts, get AI-powered optimized versions with before/after comparisons, and track their prompt history.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: Convex
- **Authentication & Billing**: Clerk
- **UI**: shadcn/ui + Tailwind CSS
- **Deployment**: Vercel
- **AI**: OpenAI API (with fallback)

## Features

### Core Features
- ✅ Prompt optimization with AI-powered suggestions
- ✅ Before/after comparison view
- ✅ Settings panel (target model, tone, output preference)
- ✅ Usage tracking and limits
- ✅ Prompt history for authenticated users
- ✅ Iteration support (refine again)

### Authentication & Billing
- ✅ Public landing page
- ✅ Clerk authentication
- ✅ Stripe billing integration
- ✅ Free tier: 10 optimizations/day
- ✅ Starter tier: 100 optimizations/day ($12/month)
- ✅ Pro tier: Unlimited optimizations ($29/month)

### Pages
- `/` - Landing page with examples
- `/app` - Main optimization interface
- `/history` - Saved prompt history
- `/pricing` - Pricing plans
- `/account` - Account management

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Convex account (free at https://convex.dev)
- Clerk account (free at https://clerk.com)
- OpenAI API key (optional, has fallback)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Prompt you to log in to Convex
   - Create a new project
   - Add `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` to `.env.local`

3. **Set up Clerk**
   - Go to https://clerk.com and create a new application
   - Copy your publishable and secret keys
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```

4. **Set up Claude API**
   - Get API key from https://console.anthropic.com
   - Add to `.env.local`:
     ```
     ANTHROPIC_API_KEY=sk-ant-api03-...
     ```
   - Note: The app will use a rule-based fallback if no API key is provided

5. **Set up Billing (Optional)**
   - See [BILLING_SETUP.md](./BILLING_SETUP.md) for complete setup instructions
   - Required for accepting payments for Starter/Pro tiers
   - Optional for MVP testing

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to http://localhost:3000

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# Convex (auto-populated by `npx convex dev`)
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Anthropic API (Claude)
ANTHROPIC_API_KEY=
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables from `.env.local`
   - Deploy!

3. **Set up Convex for production**
   ```bash
   npx convex deploy
   ```
   Update your Vercel environment variables with the production Convex URL.

## Project Structure

```
prompt-optimizer-saas/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── app/page.tsx          # Main optimization interface
│   │   ├── history/page.tsx      # Prompt history
│   │   ├── pricing/page.tsx      # Pricing page
│   │   ├── account/page.tsx      # Account settings
│   │   ├── api/
│   │   │   └── optimize/route.ts # AI optimization API
│   │   └── layout.tsx            # Root layout with providers
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   └── ConvexClientProvider.tsx
│   ├── lib/
│   │   └── utils.ts
│   └── middleware.ts             # Clerk auth middleware
├── convex/
│   ├── schema.ts                 # Database schema
│   └── prompts.ts                # Database functions
├── .env.local                    # Environment variables (create this)
├── .env.example                  # Example environment file
└── README.md
```

## Database Schema

### Prompts Table
- `userId`: User ID from Clerk
- `originalPrompt`: Original user prompt
- `optimizedPrompt`: AI-optimized version
- `settings`: Optimization settings (model, tone, preference)
- `explanation`: What changed and why
- `timestamp`: Creation time

### Usage Table
- `userId`: User ID
- `count`: Number of optimizations today
- `lastReset`: Last reset timestamp
- `plan`: "free" or "pro"

## AI Optimization

The optimization API (`/api/optimize`) uses:
1. **Claude Haiku 4.5**: Anthropic's fast, intelligent model for prompt optimization
2. **Rule-based fallback**: Structured prompt enhancement if no API key

The AI adds:
- Clear role definition
- Specific constraints and requirements
- Output format instructions
- Task boundaries
- Structured, unambiguous language

Model: `claude-haiku-4-5-20251001`

## Privacy

- Unauthenticated users: Prompts are processed but NOT stored
- Authenticated users: Prompts stored for history
- No prompts are used for model training
- Users can delete their prompt history

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run Convex in development mode
npx convex dev

# Build for production
npm run build

# Deploy Convex to production
npx convex deploy
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
