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

export default function AppPage() {
  const { user } = useUser();
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const [settings, setSettings] = useState({
    targetModel: "gpt-4",
    tone: "technical",
    outputPreference: "detailed",
  });

  const savePrompt = useMutation(api.prompts.savePrompt);
  const trackUsage = useMutation(api.prompts.trackUsage);
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

      // Track usage and save if user is logged in
      if (user) {
        await trackUsage({ userId: user.id });
        await savePrompt({
          userId: user.id,
          originalPrompt,
          optimizedPrompt: data.optimizedPrompt,
          settings,
          explanation: data.explanation,
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

  const canOptimize = () => {
    if (!user) return true; // Allow unauthenticated users to try
    if (usage?.plan === "pro") return true;
    return (usage?.count || 0) < 10; // Free tier limit
  };

  return (
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
                <Badge variant="outline">
                  {usage?.plan === "pro" ? "Pro" : `${usage?.count || 0}/10 today`}
                </Badge>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Optimize Your Prompt</h2>
          <p className="text-zinc-400">
            Transform your prompts into more effective, structured instructions
          </p>
        </div>

        {/* Settings Panel */}
        <Card className="p-6 bg-zinc-900 border-zinc-800 mb-6">
          <h3 className="font-semibold mb-4">Settings</h3>
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
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
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

        {/* Input Section */}
        <Card className="p-6 bg-zinc-900 border-zinc-800 mb-6">
          <label className="font-semibold mb-3 block">Original Prompt</label>
          <Textarea
            value={originalPrompt}
            onChange={(e) => setOriginalPrompt(e.target.value)}
            placeholder="Paste your prompt here..."
            className="min-h-[200px] bg-black border-zinc-800 resize-none"
          />
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-zinc-500">
              {originalPrompt.length} characters
            </div>
            <Button
              onClick={handleOptimize}
              disabled={!originalPrompt.trim() || isOptimizing || !canOptimize()}
              size="lg"
            >
              {isOptimizing ? "Optimizing..." : "Optimize Prompt"}
            </Button>
          </div>
          {!canOptimize() && (
            <div className="mt-2 text-sm text-yellow-500">
              Daily limit reached. Upgrade to Pro for unlimited optimizations.
            </div>
          )}
        </Card>

        {/* Results Section */}
        {optimizedPrompt && (
          <Tabs defaultValue="result" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="result">Optimized Prompt</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="result" className="mt-6">
              <Card className="p-6 bg-zinc-900 border-zinc-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Optimized Prompt</h3>
                  <Button onClick={handleCopy} variant="outline">
                    Copy to Clipboard
                  </Button>
                </div>
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
                    }}
                  >
                    Refine Again
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="comparison" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 bg-zinc-900 border-zinc-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-red-950 text-red-400">
                      Before
                    </Badge>
                  </div>
                  <div className="bg-black p-4 rounded-lg border border-zinc-800">
                    <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-sm">
                      {originalPrompt}
                    </pre>
                  </div>
                </Card>

                <Card className="p-6 bg-zinc-900 border-zinc-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-green-950 text-green-400">
                      After
                    </Badge>
                  </div>
                  <div className="bg-black p-4 rounded-lg border border-zinc-800">
                    <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-sm">
                      {optimizedPrompt}
                    </pre>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
