"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
// @ts-ignore - Convex types will be generated after running npx convex dev
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTag, setNewTag] = useState("");
  const [editingTagsFor, setEditingTagsFor] = useState<Id<"prompts"> | null>(null);

  const prompts = useQuery(
    api.prompts.getFilteredPrompts,
    user ? { 
      userId: user.id,
      showFavoritesOnly,
      filterTags: selectedTags.length > 0 ? selectedTags : undefined,
      searchQuery: searchQuery || undefined,
    } : "skip"
  );
  
  const allTags = useQuery(
    api.prompts.getUserTags,
    user ? { userId: user.id } : "skip"
  );
  
  const usage = useQuery(api.prompts.getUsage, user ? { userId: user.id } : "skip");
  const deletePrompt = useMutation(api.prompts.deletePrompt);
  const toggleFavorite = useMutation(api.prompts.toggleFavorite);
  const addTag = useMutation(api.prompts.addTag);
  const removeTag = useMutation(api.prompts.removeTag);

  const handleDelete = async (id: Id<"prompts">) => {
    if (confirm("Delete this prompt?")) {
      await deletePrompt({ id });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleExportJSON = () => {
    if (!prompts || prompts.length === 0) {
      alert("No prompts to export");
      return;
    }

    const exportData = prompts.map((p: any) => ({
      timestamp: new Date(p.timestamp).toISOString(),
      targetModel: p.settings.targetModel,
      tone: p.settings.tone,
      outputPreference: p.settings.outputPreference,
      originalPrompt: p.originalPrompt,
      optimizedPrompt: p.optimizedPrompt,
      explanation: p.explanation || "",
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptfix-history-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!prompts || prompts.length === 0) {
      alert("No prompts to export");
      return;
    }

    const headers = [
      "Timestamp",
      "Target Model",
      "Tone",
      "Output Preference",
      "Original Prompt",
      "Optimized Prompt",
      "Explanation",
    ];

    const rows = prompts.map((p: any) => [
      new Date(p.timestamp).toISOString(),
      p.settings.targetModel,
      p.settings.tone,
      p.settings.outputPreference,
      `"${p.originalPrompt.replace(/"/g, '""')}"`,
      `"${p.optimizedPrompt.replace(/"/g, '""')}"`,
      `"${(p.explanation || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptfix-history-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const canExport = () => {
    return usage?.plan === "starter" || usage?.plan === "pro";
  };

  const handleToggleFavorite = async (promptId: Id<"prompts">) => {
    await toggleFavorite({ promptId });
  };

  const handleAddTag = async (promptId: Id<"prompts">) => {
    if (!newTag.trim()) return;
    await addTag({ promptId, tag: newTag.trim() });
    setNewTag("");
    setEditingTagsFor(null);
  };

  const handleRemoveTag = async (promptId: Id<"prompts">, tag: string) => {
    await removeTag({ promptId, tag });
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
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
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">Prompt History</h2>
            <p className="text-zinc-400">
              View and manage your saved prompt optimizations
            </p>
          </div>
          
          {prompts && prompts.length > 0 && (
            <div className="flex gap-2">
              {canExport() ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleExportJSON}
                    className="border-zinc-700"
                  >
                    Export JSON
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportCSV}
                    className="border-zinc-700"
                  >
                    Export CSV
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  disabled
                  className="border-zinc-700"
                  title="Upgrade to Starter or Pro for export functionality"
                >
                  Export (Pro Feature)
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Filters and Search */}
        <Card className="p-4 bg-zinc-900 border-zinc-800 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div>
              <input
                type="text"
                placeholder="🔍 Search prompts, tags, or explanations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={showFavoritesOnly ? "bg-yellow-600 hover:bg-yellow-700" : ""}
              >
                ⭐ {showFavoritesOnly ? "Showing Favorites" : "Show Favorites"}
              </Button>

              {allTags && allTags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-zinc-400">Tags:</span>
                  {allTags.map((tag: string) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`cursor-pointer ${
                        selectedTags.includes(tag)
                          ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                          : "hover:bg-zinc-800"
                      }`}
                      onClick={() => toggleTagFilter(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {(showFavoritesOnly || selectedTags.length > 0 || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowFavoritesOnly(false);
                    setSelectedTags([]);
                    setSearchQuery("");
                  }}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {(showFavoritesOnly || selectedTags.length > 0 || searchQuery) && (
              <div className="text-sm text-zinc-500">
                Showing {prompts?.length || 0} result{prompts?.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </Card>

        {!prompts || prompts.length === 0 ? (
          <Card className="p-12 bg-zinc-900 border-zinc-800 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">
              {showFavoritesOnly || selectedTags.length > 0 || searchQuery 
                ? "No prompts match your filters" 
                : "No prompts yet"}
            </h3>
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
              <Card key={prompt._id} className="p-6 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2 items-center flex-wrap">
                    <Badge variant="outline">{prompt.settings.targetModel}</Badge>
                    <Badge variant="outline">{prompt.settings.tone}</Badge>
                    {prompt.originalScore && prompt.optimizedScore && (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        +{prompt.optimizedScore - prompt.originalScore} pts
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleFavorite(prompt._id)}
                      className={`text-2xl transition-all hover:scale-110 ${
                        prompt.isFavorite ? "text-yellow-400" : "text-zinc-600 hover:text-zinc-400"
                      }`}
                      title={prompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {prompt.isFavorite ? "⭐" : "☆"}
                    </button>
                    <div className="text-sm text-zinc-500">
                      {new Date(prompt.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Tags Display and Management */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {prompt.tags && prompt.tags.length > 0 && prompt.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-blue-500/10 text-blue-300 border-blue-500/30 flex items-center gap-1"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(prompt._id, tag)}
                          className="ml-1 hover:text-red-400 transition-colors"
                          title="Remove tag"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    
                    {editingTagsFor === prompt._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddTag(prompt._id);
                            } else if (e.key === 'Escape') {
                              setEditingTagsFor(null);
                              setNewTag("");
                            }
                          }}
                          placeholder="tag-name"
                          className="px-2 py-1 text-xs bg-black border border-zinc-700 rounded text-zinc-300 w-32"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddTag(prompt._id)}
                          className="h-6 px-2 text-xs"
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTagsFor(null);
                            setNewTag("");
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingTagsFor(prompt._id)}
                        className="text-xs text-zinc-500 hover:text-zinc-300 border border-dashed border-zinc-700 px-2 py-1 rounded"
                      >
                        + Add Tag
                      </button>
                    )}
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
