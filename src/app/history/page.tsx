"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore - Convex types will be generated after running npx convex dev
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import type { Id } from "../../../convex/_generated/dataModel";

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const prompts = useQuery(
    api.prompts.getPromptHistory,
    user ? { userId: user.id } : "skip"
  );
  const deletePrompt = useMutation(api.prompts.deletePrompt);

  const handleDelete = async (id: Id<"prompts">) => {
    if (confirm("Delete this prompt?")) {
      await deletePrompt({ id });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

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
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Sign in to view history</h2>
          <p className="text-zinc-400 mb-8">
            Create an account to save and access your prompt optimization history
          </p>
          <Link href="/sign-in">
            <Button size="lg">Sign In</Button>
          </Link>
        </main>
      </div>
    );
  }

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
            <Link href="/account">
              <Button variant="outline">Account</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Prompt History</h2>
          <p className="text-zinc-400">
            View and manage your saved prompt optimizations
          </p>
        </div>

        {!prompts || prompts.length === 0 ? (
          <Card className="p-12 bg-zinc-900 border-zinc-800 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No prompts yet</h3>
            <p className="text-zinc-400 mb-6">
              Start optimizing prompts to build your history
            </p>
            <Link href="/app">
              <Button>Optimize Your First Prompt</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {prompts.map((prompt: any) => (
              <Card key={prompt._id} className="p-6 bg-zinc-900 border-zinc-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <Badge variant="outline">{prompt.settings.targetModel}</Badge>
                    <Badge variant="outline">{prompt.settings.tone}</Badge>
                  </div>
                  <div className="text-sm text-zinc-500">
                    {new Date(prompt.timestamp).toLocaleDateString()} at{" "}
                    {new Date(prompt.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-red-950 text-red-400 border-red-900">
                        Original
                      </Badge>
                    </div>
                    <div className="bg-black p-4 rounded-lg border border-zinc-800 max-h-48 overflow-y-auto">
                      <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-sm">
                        {prompt.originalPrompt}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-950 text-green-400 border-green-900">
                        Optimized
                      </Badge>
                    </div>
                    <div className="bg-black p-4 rounded-lg border border-zinc-800 max-h-48 overflow-y-auto">
                      <pre className="text-zinc-300 whitespace-pre-wrap font-mono text-sm">
                        {prompt.optimizedPrompt}
                      </pre>
                    </div>
                  </div>
                </div>

                {prompt.explanation && (
                  <div className="mb-4 p-4 bg-black rounded-lg border border-zinc-800">
                    <div className="text-sm font-semibold mb-1 text-zinc-400">
                      What Changed:
                    </div>
                    <p className="text-sm text-zinc-300">{prompt.explanation}</p>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(prompt.optimizedPrompt)}
                  >
                    Copy Optimized
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(prompt._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
