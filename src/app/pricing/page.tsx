"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function PricingPage() {
  const { user } = useUser();

  const handleUpgrade = (plan: string) => {
    if (!user) {
      // Redirect to sign up if not logged in
      window.location.href = '/sign-up';
      return;
    }

    // Redirect to Clerk's billing portal
    window.location.href = `/account?upgrade=${plan}`;
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer">PromptFix</h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/app">
              <Button variant="ghost">Try Free</Button>
            </Link>
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-zinc-400">
            Choose the plan that fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-zinc-400">/month</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-zinc-400 text-sm">Perfect for trying out the platform</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">10 optimizations per day</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">All optimization settings</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">Before/after comparison</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">AI explanations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">7-day prompt history</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-zinc-600 mt-0.5">✗</div>
                <span className="text-zinc-500">Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-zinc-600 mt-0.5">✗</div>
                <span className="text-zinc-500">Export functionality</span>
              </li>
            </ul>

            <Link href="/app">
              <Button variant="outline" className="w-full">
                Get Started Free
              </Button>
            </Link>
          </Card>

          {/* Starter Plan */}
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">$12</span>
                <span className="text-zinc-400">/month</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-zinc-400 text-sm">For regular users and hobbyists</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300 font-semibold">100 optimizations per day</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">All optimization settings</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">Before/after comparison</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">AI explanations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">30-day prompt history</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">Export to JSON/CSV</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-zinc-600 mt-0.5">✗</div>
                <span className="text-zinc-500">Priority support</span>
              </li>
            </ul>

            <Button 
              variant="outline" 
              className="w-full border-blue-500/50 hover:bg-blue-500/10"
              onClick={() => handleUpgrade('starter')}
            >
              Upgrade to Starter
            </Button>
          </Card>

          {/* Pro Plan */}
          <Card className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-blue-500/50 relative scale-105 shadow-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                MOST POPULAR
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-zinc-400">/month</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-zinc-400 text-sm">For professionals and power users</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300 font-semibold">Unlimited optimizations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">All optimization settings</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">Before/after comparison</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">AI explanations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">Unlimited prompt history</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">Export to JSON/CSV</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">Priority email support</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="text-green-500 mt-0.5">✓</div>
                <span className="text-zinc-300">Usage analytics</span>
              </li>
            </ul>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => handleUpgrade('pro')}
            >
              Upgrade to Pro
            </Button>
            <p className="text-center text-xs text-zinc-500 mt-3">
              Cancel anytime
            </p>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h3>

          <div className="space-y-6">
            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h4 className="font-semibold mb-2">
                What counts as a prompt optimization?
              </h4>
              <p className="text-zinc-400 text-sm">
                Each time you click "Optimize Prompt" counts as one optimization.
                Viewing history or copying previously optimized prompts doesn't
                count toward your limit.
              </p>
            </Card>

            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h4 className="font-semibold mb-2">
                Can I change my plan later?
              </h4>
              <p className="text-zinc-400 text-sm">
                Yes! You can upgrade or downgrade at any time. When upgrading, you'll get immediate access. When downgrading, changes take effect at the end of your current billing period.
              </p>
            </Card>

            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h4 className="font-semibold mb-2">
                Do you store my prompts?
              </h4>
              <p className="text-zinc-400 text-sm">
                Prompts are only stored if you're signed in and have an account.
                Anonymous users can optimize prompts without any data being saved.
                Your prompts are never used for model training.
              </p>
            </Card>

            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h4 className="font-semibold mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-zinc-400 text-sm">
                We accept all major credit cards through our secure payment
                processor. Enterprise billing options available upon request.
              </p>
            </Card>

            <Card className="p-6 bg-zinc-900 border-zinc-800">
              <h4 className="font-semibold mb-2">
                Is there a team or enterprise plan?
              </h4>
              <p className="text-zinc-400 text-sm">
                Not yet, but we're working on team features! If you're interested
                in an enterprise plan, please contact us for early access.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <Card className="p-12 bg-zinc-900 border-zinc-800 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              Ready to optimize your prompts?
            </h3>
            <p className="text-zinc-400 mb-8 text-lg">
              Start with our free plan, no credit card required
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/app">
                <Button size="lg" className="px-8">
                  Start Free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center text-zinc-500 text-sm">
            <div>© 2026 PromptFix. All rights reserved.</div>
            <div className="flex gap-6">
              <Link href="/pricing" className="hover:text-white">
                Pricing
              </Link>
              <Link href="/app" className="hover:text-white">
                App
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
