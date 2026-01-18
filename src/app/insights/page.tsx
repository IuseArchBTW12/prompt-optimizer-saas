"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

export default function InsightsPage() {
  const { user, isLoaded } = useUser();
  const insights = useQuery(
    api.prompts.getInsights,
    user ? { userId: user.id } : "skip"
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
        <header className="border-b border-zinc-800">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold cursor-pointer">PromptFix</h1>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Sign In Required</h2>
          <p className="text-zinc-400 mb-8">
            You need to be signed in to view your insights.
          </p>
          <Link href="/sign-in">
            <Button size="lg">Sign In</Button>
          </Link>
        </main>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black flex items-center justify-center">
        <div className="text-zinc-400">Loading insights...</div>
      </div>
    );
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
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
              <Button variant="ghost">Optimize</Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost">History</Button>
            </Link>
            <Link href="/account">
              <Button variant="outline">Account</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div {...fadeInUp} className="mb-8">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            📊 Prompt Insights
          </h2>
          <p className="text-zinc-400">
            Analytics and optimization trends from the last 30 days
          </p>
        </motion.div>

        {insights.totalPrompts === 0 ? (
          <Card className="p-12 bg-zinc-900 border-zinc-800 text-center">
            <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
            <p className="text-zinc-400 mb-6">
              Start optimizing prompts to see your insights and analytics here.
            </p>
            <Link href="/app">
              <Button>Optimize Your First Prompt</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid md:grid-cols-4 gap-4"
            >
              <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-900/95 border-zinc-800">
                <div className="text-3xl font-bold text-blue-400 mb-1">
                  {insights.totalPrompts}
                </div>
                <div className="text-sm text-zinc-400">Total Optimizations</div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-900/95 border-zinc-800">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  +{insights.avgImprovement}
                </div>
                <div className="text-sm text-zinc-400">Avg Score Improvement</div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-900/95 border-zinc-800">
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {insights.tokenSavings.toLocaleString()}
                </div>
                <div className="text-sm text-zinc-400">Tokens Saved</div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-900/95 border-zinc-800">
                <div className="text-3xl font-bold text-pink-400 mb-1">
                  ${(insights.tokenSavings * 0.00002).toFixed(2)}
                </div>
                <div className="text-sm text-zinc-400">Estimated Savings</div>
              </Card>
            </motion.div>

            {/* Most Improved Prompts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🏆 Top 5 Most Improved Prompts
                </h3>
                <div className="space-y-3">
                  {insights.mostImproved.map((prompt: any, idx: number) => (
                    <div
                      key={prompt.id}
                      className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                    >
                      <div className="text-2xl font-bold text-zinc-600">#{idx + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-300 truncate mb-1">
                          {prompt.originalPrompt}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          <span>{new Date(prompt.timestamp).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{prompt.originalScore} → {prompt.optimizedScore}</span>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        +{prompt.improvement} points
                      </Badge>
                    </div>
                  ))}
                  {insights.mostImproved.length === 0 && (
                    <div className="text-center text-zinc-500 py-8">
                      No improvement data available yet
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Usage Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  📈 Success Rate Trends
                </h3>
                {insights.trendData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={insights.trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#71717a"
                          tick={{ fill: '#71717a' }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis stroke="#71717a" tick={{ fill: '#71717a' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#18181b', 
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="avgImprovement" 
                          stroke="#22c55e" 
                          strokeWidth={2}
                          name="Avg Improvement"
                          dot={{ fill: '#22c55e', r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Optimizations"
                          dot={{ fill: '#3b82f6', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-zinc-500 py-16">
                    Optimize more prompts to see trends over time
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Best Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  ⚙️ Best Performing Settings
                </h3>
                {insights.bestSettings.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={insights.bestSettings}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis 
                          dataKey="tone" 
                          stroke="#71717a"
                          tick={{ fill: '#71717a' }}
                        />
                        <YAxis stroke="#71717a" tick={{ fill: '#71717a' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#18181b', 
                            border: '1px solid #27272a',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                          formatter={(value: any, name: string) => {
                            if (name === 'avgImprovement') return [`${value} points`, 'Avg Improvement'];
                            return [value, name];
                          }}
                        />
                        <Bar 
                          dataKey="avgImprovement" 
                          fill="#a855f7"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-zinc-500 py-16">
                    Try different settings to see which work best
                  </div>
                )}
                {insights.bestSettings.length > 0 && (
                  <div className="mt-4 grid md:grid-cols-2 gap-3">
                    {insights.bestSettings.slice(0, 4).map((setting: any, idx: number) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium text-zinc-300">
                            {setting.targetModel} • {setting.tone} • {setting.outputPreference}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {setting.count} optimizations
                          </div>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          +{setting.avgImprovement}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Token Usage Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <h3 className="text-lg font-semibold mb-4">💎 Token Usage</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-zinc-400">Original Prompts</span>
                      <span className="text-sm font-semibold text-red-400">
                        {insights.totalOriginalTokens.toLocaleString()} tokens
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-zinc-400">Optimized Prompts</span>
                      <span className="text-sm font-semibold text-green-400">
                        {insights.totalOptimizedTokens.toLocaleString()} tokens
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ 
                          width: insights.totalOriginalTokens > 0 
                            ? `${(insights.totalOptimizedTokens / insights.totalOriginalTokens) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-950/30 to-zinc-900 border-green-900/30">
                <h3 className="text-lg font-semibold mb-2 text-green-300">💰 Cost Savings</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Based on GPT-4 pricing (~$0.03 per 1K tokens)
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Tokens saved:</span>
                    <span className="font-semibold text-green-400">
                      {insights.tokenSavings.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Money saved:</span>
                    <span className="font-semibold text-green-400">
                      ${(insights.tokenSavings * 0.00002).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-900/30">
                    <span className="text-zinc-300">Efficiency gain:</span>
                    <span className="font-bold text-green-300">
                      {insights.totalOriginalTokens > 0 
                        ? Math.round((insights.tokenSavings / insights.totalOriginalTokens) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
