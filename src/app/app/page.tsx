"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";

// Prompt templates
const PROMPT_TEMPLATES = [
  {
    name: "Code Review",
    category: "Development",
    icon: "🔍",
    prompt: "Review the following code for:\n- Potential bugs or errors\n- Performance issues\n- Security vulnerabilities\n- Code style and best practices\n- Suggestions for improvement\n\n[Paste your code here]"
  },
  {
    name: "Documentation Generator",
    category: "Development",
    icon: "📚",
    prompt: "Generate comprehensive documentation for the following code. Include:\n- Purpose and overview\n- Function/method descriptions\n- Parameters and return values\n- Usage examples\n- Edge cases and limitations\n\n[Paste your code here]"
  },
  {
    name: "Bug Analysis",
    category: "Development",
    icon: "🐛",
    prompt: "Analyze the following bug report and code:\n\nBug Description: [Describe the bug]\n\nProvide:\n1. Root cause analysis\n2. Step-by-step debugging approach\n3. Potential fixes\n4. Prevention strategies\n\n[Paste relevant code here]"
  },
  {
    name: "API Design",
    category: "Development",
    icon: "🔌",
    prompt: "Design a RESTful API for: [Your feature/service]\n\nRequirements:\n- List endpoints with HTTP methods\n- Request/response schemas\n- Authentication approach\n- Error handling strategy\n- Rate limiting considerations"
  },
  {
    name: "Test Case Generation",
    category: "Development",
    icon: "✅",
    prompt: "Generate comprehensive test cases for the following functionality:\n\n[Describe the feature/function]\n\nInclude:\n- Unit tests\n- Integration tests\n- Edge cases\n- Error scenarios\n- Expected inputs and outputs"
  },
  {
    name: "Explain Like I'm 5",
    category: "Education",
    icon: "🎓",
    prompt: "Explain the following concept in simple terms that a beginner can understand:\n\n[Topic or concept]\n\nUse:\n- Simple analogies\n- Real-world examples\n- No jargon\n- Step-by-step breakdown"
  },
  {
    name: "Technical Writer",
    category: "Content",
    icon: "✍️",
    prompt: "Write a technical article about: [Topic]\n\nTarget Audience: [e.g., developers, beginners, etc.]\n\nInclude:\n- Clear introduction\n- Main concepts explained\n- Code examples\n- Best practices\n- Conclusion and next steps"
  },
  {
    name: "SQL Query Builder",
    category: "Development",
    icon: "🗄️",
    prompt: "Create an SQL query to:\n\n[Describe what you need to query]\n\nDatabase schema:\n[Describe tables and relationships]\n\nProvide:\n- Optimized query\n- Explanation of each part\n- Index recommendations\n- Potential performance issues"
  }
];

// Token counting utility (rough estimate: ~4 chars per token)
const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// Cost estimation (per 1K tokens)
const PRICING = {
  gpt4: { input: 0.03, output: 0.06 },
  claude: { input: 0.008, output: 0.024 },
  generic: { input: 0.01, output: 0.03 }
};

const estimateCost = (tokens: number, model: string): number => {
  const pricing = PRICING[model as keyof typeof PRICING] || PRICING.generic;
  return (tokens / 1000) * pricing.input;
};

export default function AppPage() {
  const { user } = useUser();
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [originalScore, setOriginalScore] = useState<number | null>(null);
  const [optimizedScore, setOptimizedScore] = useState<number | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const [settings, setSettings] = useState({
    targetModel: "claude",
    tone: "technical",
    outputPreference: "detailed",
  });

  const savePrompt = useMutation(api.prompts.savePrompt);
  const trackUsage = useMutation(api.prompts.trackUsage);
  const postToCommunity = useMutation(api.prompts.postToCommunity);
  const usage = useQuery(api.prompts.getUsage, user ? { userId: user.id } : "skip");

  const handleOptimize = async () => {
    if (!originalPrompt.trim()) return;

    setIsOptimizing(true);
    
    try {
      // Call the optimization API
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: originalPrompt,
          settings,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }

      setOptimizedPrompt(data.optimizedPrompt);
      setExplanation(data.explanation);
      setOriginalScore(data.originalScore || null);
      setOptimizedScore(data.optimizedScore || null);
      setScoreBreakdown(data.scoreBreakdown || null);

      // Track usage and save if user is logged in
      if (user) {
        await trackUsage({ userId: user.id });
        
        // Estimate token counts (rough approximation: ~4 chars per token)
        const originalTokens = Math.ceil(originalPrompt.length / 4);
        const optimizedTokens = Math.ceil(data.optimizedPrompt.length / 4);
        
        await savePrompt({
          userId: user.id,
          originalPrompt,
          optimizedPrompt: data.optimizedPrompt,
          settings,
          explanation: data.explanation,
          originalScore: data.originalScore,
          optimizedScore: data.optimizedScore,
          originalTokens,
          optimizedTokens,
        });
      }
    } catch (error) {
      console.error("Optimization error:", error);
      alert("Failed to optimize prompt. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedPrompt);
    alert("Copied to clipboard!");
  };

  const handleShareToCommunity = async () => {
    if (!user || !optimizedPrompt) return;

    try {
      await postToCommunity({
        userId: user.id,
        userName: user.fullName || user.username || "Anonymous",
        userAvatar: user.imageUrl,
        originalPrompt,
        optimizedPrompt,
        settings,
        scoreImprovement: optimizedScore && originalScore ? optimizedScore - originalScore : undefined,
      });
      alert("✅ Shared to Community!");
    } catch (error) {
      console.error("Failed to share:", error);
      alert("Failed to share. Please try again.");
    }
  };

  const canOptimize = () => {
    if (!user) return true; // Allow unauthenticated users to try
    if (!usage) return true;
    
    // Pro tier: unlimited
    if (usage.plan === "pro") return true;
    
    // Starter tier: 100 per day
    if (usage.plan === "starter") {
      return (usage.count || 0) < 100;
    }
    
    // Free tier: 10 per day
    return (usage.count || 0) < 10;
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer">PromptFix</h1>
          </Link>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <Badge variant="outline" className="text-sm">
                  {usage?.plan === "pro" 
                    ? "Pro - Unlimited" 
                    : usage?.plan === "starter"
                    ? `Starter: ${usage?.count || 0}/100 today`
                    : `Free: ${usage?.count || 0}/10 today`}
                </Badge>
                <Link href="/insights">
                  <Button variant="ghost">Insights</Button>
                </Link>
                <Link href="/community">
                  <Button variant="ghost">Community</Button>
                </Link>
                <Link href="/history">
                  <Button variant="ghost">History</Button>
                </Link>
                <Link href="/account">
                  <Button variant="outline">Account</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div 
          className="mb-8 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text relative z-10">✨ Optimize Your Prompt</h2>
          <p className="text-zinc-400 relative z-10">
            Transform your prompts into more effective, structured instructions
          </p>
        </motion.div>

        {/* Settings Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur-xl" />
          <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-900/95 border-zinc-800 mb-6 relative shadow-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">⚙️ Settings</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Target Model
              </label>
              <Select
                value={settings.targetModel}
                onValueChange={(value) =>
                  setSettings({ ...settings, targetModel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="generic">Generic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Tone</label>
              <Select
                value={settings.tone}
                onValueChange={(value) =>
                  setSettings({ ...settings, tone: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">
                Output Preference
              </label>
              <Select
                value={settings.outputPreference}
                onValueChange={(value) =>
                  setSettings({ ...settings, outputPreference: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg blur-xl" />
          <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-900/95 border-zinc-800 mb-6 relative shadow-2xl">
          <div className="flex justify-between items-center mb-3">
            <label className="font-semibold flex items-center gap-2">📝 Original Prompt</label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-xs"
            >
              {showTemplates ? "Hide" : "📋 Templates"}
            </Button>
          </div>

          {/* Template Library */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="bg-black/50 p-4 rounded-lg border border-zinc-800">
                  <h4 className="text-sm font-semibold mb-3 text-zinc-300">Quick Start Templates</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {PROMPT_TEMPLATES.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => {
                          setOriginalPrompt(template.prompt);
                          setShowTemplates(false);
                        }}
                        className="text-left p-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{template.icon}</span>
                          <span className="text-sm font-semibold text-zinc-200 group-hover:text-white">
                            {template.name}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500">{template.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Textarea
            value={originalPrompt}
            onChange={(e) => setOriginalPrompt(e.target.value)}
            placeholder="Paste your prompt here..."
            className="min-h-[200px] bg-black border-zinc-800 resize-none"
          />
          <div className="mt-4 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="text-zinc-500">
                {originalPrompt.length} characters
              </div>
              {originalPrompt && (
                <>
                  <div className="text-zinc-600">•</div>
                  <div className="text-zinc-400">
                    ~{estimateTokens(originalPrompt).toLocaleString()} tokens
                  </div>
                  <div className="text-zinc-600">•</div>
                  <div className="text-zinc-400">
                    ${estimateCost(estimateTokens(originalPrompt), settings.targetModel).toFixed(4)} estimated cost
                  </div>
                </>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleOptimize}
                disabled={!originalPrompt.trim() || isOptimizing || !canOptimize()}
                size="lg"
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25"
              >
                {isOptimizing && (
                  <motion.div
                    className="absolute inset-0 bg-blue-500/20"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                )}
                <span className="relative z-10">
                  {isOptimizing ? "Optimizing..." : "Optimize Prompt"}
                </span>
              </Button>
            </motion.div>
          </div>
          {!canOptimize() && (
            <motion.div 
              className="mt-2 text-sm text-yellow-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Daily limit reached. Upgrade to Pro for unlimited optimizations.
            </motion.div>
          )}
        </Card>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
        {optimizedPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5 }}
          >
          <Tabs defaultValue="result" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="result">Optimized Prompt</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="result" className="mt-6">
              <Card className="p-6 bg-gradient-to-br from-zinc-900 to-zinc-900/95 border-zinc-800 shadow-2xl">
                {/* Quality Score Display */}
                {(originalScore !== null && optimizedScore !== null) && (
                  <motion.div 
                    className="mb-6 p-4 bg-gradient-to-r from-blue-950/30 to-purple-950/30 border border-blue-900/30 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h4 className="text-sm font-semibold mb-3 text-blue-300">📊 Quality Score</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Original Score */}
                      <div className="space-y-2">
                        <div className="text-xs text-zinc-400">Before</div>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-bold text-red-400">{originalScore}</span>
                          <span className="text-zinc-500 mb-1">/100</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <motion.div 
                            className="bg-red-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${originalScore}%` }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                          />
                        </div>
                      </div>

                      {/* Optimized Score */}
                      <div className="space-y-2">
                        <div className="text-xs text-zinc-400">After</div>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-bold text-green-400">{optimizedScore}</span>
                          <span className="text-zinc-500 mb-1">/100</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <motion.div 
                            className="bg-green-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${optimizedScore}%` }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Improvement Badge */}
                    <div className="mt-4 flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        +{optimizedScore - originalScore} points improvement
                      </Badge>
                      <span className="text-xs text-zinc-400">
                        ({Math.round(((optimizedScore - originalScore) / originalScore) * 100)}% increase)
                      </span>
                    </div>

                    {/* Score Breakdown */}
                    {scoreBreakdown && (
                      <details className="mt-4">
                        <summary className="text-xs text-zinc-400 cursor-pointer hover:text-zinc-300">
                          View detailed breakdown
                        </summary>
                        <div className="mt-3 space-y-2">
                          {Object.entries(scoreBreakdown.original).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex items-center gap-3 text-xs">
                              <span className="w-28 text-zinc-400 capitalize">
                                {key === 'outputFormat' ? 'Output Format' : key}:
                              </span>
                              <div className="flex-1 flex gap-2 items-center">
                                <div className="w-12 text-red-400">{value}</div>
                                <div className="text-zinc-600">→</div>
                                <div className="w-12 text-green-400">{scoreBreakdown.optimized[key]}</div>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  +{scoreBreakdown.optimized[key] - value}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </motion.div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold flex items-center gap-2">🚀 Optimized Prompt</h3>
                  <div className="flex gap-2">
                    <Button onClick={handleShareToCommunity} variant="outline" className="bg-blue-950 border-blue-800 hover:bg-blue-900">
                      🌍 Share to Community
                    </Button>
                    <Button onClick={handleCopy} variant="outline">
                      📋 Copy
                    </Button>
                  </div>
                </div>

                {/* Token & Cost Comparison */}
                {optimizedPrompt && (
                  <div className="mb-4 grid md:grid-cols-3 gap-3">
                    <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                      <div className="text-xs text-zinc-500 mb-1">Tokens</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-red-400 text-sm">{estimateTokens(originalPrompt)}</span>
                        <span className="text-zinc-600">→</span>
                        <span className="text-green-400 text-sm">{estimateTokens(optimizedPrompt)}</span>
                      </div>
                    </div>
                    <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                      <div className="text-xs text-zinc-500 mb-1">Est. Cost</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-red-400 text-sm">
                          ${estimateCost(estimateTokens(originalPrompt), settings.targetModel).toFixed(4)}
                        </span>
                        <span className="text-zinc-600">→</span>
                        <span className="text-green-400 text-sm">
                          ${estimateCost(estimateTokens(optimizedPrompt), settings.targetModel).toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-950/30 to-zinc-950/50 p-3 rounded-lg border border-green-900/30">
                      <div className="text-xs text-green-400 mb-1">Savings</div>
                      <div className="text-green-300 text-sm font-semibold">
                        {estimateTokens(originalPrompt) > estimateTokens(optimizedPrompt)
                          ? `${estimateTokens(originalPrompt) - estimateTokens(optimizedPrompt)} tokens`
                          : `+${estimateTokens(optimizedPrompt) - estimateTokens(originalPrompt)} tokens (more detailed)`
                        }
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-black p-4 rounded-lg border border-zinc-800">
                  <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-sm">
                    {optimizedPrompt}
                  </pre>
                </div>
                
                {explanation && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">What Changed</h4>
                    <div className="bg-black p-4 rounded-lg border border-zinc-800">
                      <p className="text-zinc-400 text-sm">{explanation}</p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOriginalPrompt(optimizedPrompt);
                      setOptimizedPrompt("");
                      setExplanation("");
                      setOriginalScore(null);
                      setOptimizedScore(null);
                      setScoreBreakdown(null);
                    }}
                  >
                    Refine Again
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-red-500/10 rounded-lg blur-xl" />
                  <Card className="p-6 bg-gradient-to-br from-zinc-900 via-red-950/20 to-zinc-900 border-red-900/30 relative shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="bg-red-950 text-red-400 border-red-800">
                        ❌ Before
                      </Badge>
                    </div>
                    <div className="bg-black/50 p-4 rounded-lg border border-red-900/30">
                      <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-sm">
                        {originalPrompt}
                      </pre>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-green-500/10 rounded-lg blur-xl" />
                  <Card className="p-6 bg-gradient-to-br from-zinc-900 via-green-950/20 to-zinc-900 border-green-900/30 relative shadow-2xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="bg-green-950 text-green-400 border-green-800">
                        ✅ After
                      </Badge>
                    </div>
                    <div className="bg-black/50 p-4 rounded-lg border border-green-900/30">
                      <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-sm">
                        {optimizedPrompt}
                      </pre>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
    </PageTransition>
  );
}
