"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black" suppressHydrationWarning>
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-zinc-800"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">PromptFix</h1>
          <div className="flex gap-4">
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <Link href="/app">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                ) : (
                  <Link href="/sign-up">
                    <Button variant="ghost">Try Free</Button>
                  </Link>
                )}
              </>
            )}
            <Link href="/pricing">
              <Button variant="outline">Pricing</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <motion.div 
          className="text-center max-w-4xl mx-auto space-y-8"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-bold tracking-tight"
          >
            Optimize Your AI Prompts
            <br />
            <span className="text-zinc-400">Get Better Results</span>
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            Transform vague prompts into precise, effective instructions.
            Built for developers who want consistent, high-quality LLM outputs.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex justify-center gap-4"
          >
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8">
                Try it Free
              </Button>
            </Link>
            <Link href="#example">
              <Button size="lg" variant="outline" className="text-lg px-8">
                See Example
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Before/After Example */}
        <motion.div 
          id="example" 
          className="mt-32 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            Before & After
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-3 py-1 bg-red-950 text-red-400 rounded-full text-sm font-medium">
                    Before
                  </div>
                </div>
              <div className="bg-black p-4 rounded-lg border border-zinc-800">
                <p className="text-zinc-300 font-mono text-sm">
                  Write code for a login page
                </p>
              </div>
              <div className="mt-4 text-sm text-zinc-500">
                Vague, lacks context, no constraints
              </div>
            </Card>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-3 py-1 bg-green-950 text-green-400 rounded-full text-sm font-medium">
                    After
                  </div>
                </div>
              <div className="bg-black p-4 rounded-lg border border-zinc-800">
                <p className="text-zinc-300 font-mono text-sm">
                  You are an expert React developer. Create a login page component with the following requirements:
                  <br /><br />
                  - Use TypeScript and functional components
                  <br />
                  - Include email and password fields with validation
                  <br />
                  - Add a submit button that handles form submission
                  <br />
                  - Display loading states and error messages
                  <br />
                  - Follow modern React best practices
                  <br /><br />
                  Output only the component code with proper TypeScript types.
                </p>
              </div>
              <div className="mt-4 text-sm text-zinc-400">
                Clear role, specific requirements, output format defined
              </div>
            </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="mt-32 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h3>
          
          <motion.div 
            className="grid md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl mb-4">📝</div>
                <h4 className="text-xl font-semibold mb-2">Paste Your Prompt</h4>
                <p className="text-zinc-400">
                  Enter your original prompt and select your target model and preferences
                </p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl mb-4">⚡</div>
                <h4 className="text-xl font-semibold mb-2">AI Optimization</h4>
                <p className="text-zinc-400">
                  Our AI analyzes and rewrites your prompt using best practices
                </p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl mb-4">📊</div>
                <h4 className="text-xl font-semibold mb-2">Quality Score</h4>
                <p className="text-zinc-400">
                  See exact improvement metrics across 5 criteria
                </p>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl mb-4">✨</div>
                <h4 className="text-xl font-semibold mb-2">Get Better Results</h4>
                <p className="text-zinc-400">
                  Copy the optimized prompt and see improved LLM outputs
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div 
          className="mt-32 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-center mb-12">
            Why Choose PromptFix?
          </h3>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Consistent Results</h4>
                    <p className="text-zinc-400 text-sm">
                      Get predictable, high-quality outputs from GPT-4, Claude, and other LLMs every time
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">⏱️</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Save Time</h4>
                    <p className="text-zinc-400 text-sm">
                      Stop the trial-and-error cycle. Get optimized prompts in seconds, not hours
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📚</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Learn Best Practices</h4>
                    <p className="text-zinc-400 text-sm">
                      See explanations of what changed and why, improving your prompt engineering skills
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">�</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Track Your Progress</h4>
                    <p className="text-zinc-400 text-sm">
                      Analytics dashboard showing improvements, token savings, and optimization patterns over time
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">⭐</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Organize & Reuse</h4>
                    <p className="text-zinc-400 text-sm">
                      Favorite prompts, add custom tags, and search your history to quickly find successful patterns
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">�🔒</div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Privacy First</h4>
                    <p className="text-zinc-400 text-sm">
                      Your prompts are never used for training. Optional storage only for authenticated users
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Pricing Preview */}
        <motion.div 
          className="mt-32 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h3>
          <p className="text-center text-zinc-400 mb-12 text-lg">
            Start free, upgrade when you need more
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="p-8 bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:scale-105 transition-all duration-300">
                <div className="mb-6">
                  <h4 className="text-2xl font-bold mb-2">Free</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-zinc-400">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-zinc-300">10 optimizations per day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-zinc-300">Quality scores & explanations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-zinc-300">Favorites & tags</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-zinc-300">7-day prompt history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-zinc-300">Basic insights dashboard</span>
                  </li>
                </ul>
                <Link href="/sign-up">
                  <Button variant="outline" className="w-full" size="lg">
                    Get Started Free
                  </Button>
                </Link>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="p-8 bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-blue-500/50 hover:border-blue-500 hover:scale-105 transition-all duration-300 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    POPULAR
                  </div>
                </div>
              <div className="mb-6">
                <h4 className="text-2xl font-bold mb-2">Starter</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">$12</span>
                  <span className="text-zinc-400">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-zinc-300 font-semibold">100 optimizations per day</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-zinc-300">All optimization settings</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-zinc-300">30-day prompt history</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className="text-zinc-300">Export to JSON/CSV</span>
                </li>
              </ul>
              <Button className="w-full" size="lg">
                Upgrade to Starter
              </Button>
            </Card>
            </motion.div>
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-zinc-400 hover:text-white text-sm transition-colors">
              View full pricing details →
            </Link>
          </div>
        </motion.div>

        {/* Social Proof / Stats */}
        <motion.div 
          className="mt-32 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-center mb-4">
            Trusted by Developers Worldwide
          </h3>
          <p className="text-center text-zinc-400 mb-12 text-lg">
            Real metrics from real users optimizing their prompts
          </p>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Prompts Optimized Chart */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:scale-105 transition-all duration-300">
              <div className="mb-4">
                <div className="text-3xl font-bold mb-1">10,000+</div>
                <div className="text-sm text-zinc-400">Prompts Optimized</div>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart
                  data={[
                    { month: "Jan", value: 2400 },
                    { month: "Feb", value: 3800 },
                    { month: "Mar", value: 5200 },
                    { month: "Apr", value: 6800 },
                    { month: "May", value: 8500 },
                    { month: "Jun", value: 10200 },
                  ]}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <defs>
                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke="#52525b" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #3f3f46',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorBlue)"
                    animationDuration={2000}
                    animationBegin={0}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    activeDot={{ r: 5, fill: '#3b82f6' }}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3 text-xs text-zinc-500">
                <span className="text-green-500">↑ 42%</span> growth this month
              </div>
            </Card>
            </motion.div>

            {/* Success Rate Chart */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:scale-105 transition-all duration-300">
              <div className="mb-4">
                <div className="text-3xl font-bold mb-1">95%</div>
                <div className="text-sm text-zinc-400">Better Results</div>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart
                  data={[
                    { month: "Jan", value: 92 },
                    { month: "Feb", value: 93 },
                    { month: "Mar", value: 94 },
                    { month: "Apr", value: 94 },
                    { month: "May", value: 95 },
                    { month: "Jun", value: 95 },
                  ]}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <defs>
                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke="#52525b" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #3f3f46',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#colorGreen)"
                    animationDuration={2000}
                    animationBegin={200}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 3 }}
                    activeDot={{ r: 5, fill: '#22c55e' }}
                    animationDuration={2000}
                    animationBegin={200}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3 text-xs text-zinc-500">
                Consistently high satisfaction
              </div>
            </Card>
            </motion.div>

            {/* Time Saved Chart */}
            <motion.div variants={fadeInUp}>
              <Card className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:scale-105 transition-all duration-300">
              <div className="mb-4">
                <div className="text-3xl font-bold mb-1">5min</div>
                <div className="text-sm text-zinc-400">Avg. Time Saved</div>
              </div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart
                  data={[
                    { month: "Jan", value: 3.2 },
                    { month: "Feb", value: 3.8 },
                    { month: "Mar", value: 4.2 },
                    { month: "Apr", value: 4.6 },
                    { month: "May", value: 4.8 },
                    { month: "Jun", value: 5.0 },
                  ]}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <defs>
                    <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke="#52525b" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #3f3f46',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fill="url(#colorPurple)"
                    animationDuration={2000}
                    animationBegin={400}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ fill: '#a855f7', r: 3 }}
                    activeDot={{ r: 5, fill: '#a855f7' }}
                    animationDuration={2000}
                    animationBegin={400}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3 text-xs text-zinc-500">
                Per prompt optimization
              </div>
            </Card>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* CTA */}
        <div className="mt-32 text-center">
          <Card className="p-12 bg-zinc-900 border-zinc-800 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              Start Optimizing Your Prompts
            </h3>
            <p className="text-zinc-400 mb-8 text-lg">
              No credit card required. Free tier available.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-12">
                Get Started Free
              </Button>
            </Link>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-32">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center text-zinc-500 text-sm">
            <div>© 2026 PromptFix. All rights reserved.</div>
            <div className="flex gap-6">
              <Link href="/pricing" className="hover:text-white">Pricing</Link>
              <Link href="/app" className="hover:text-white">App</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
