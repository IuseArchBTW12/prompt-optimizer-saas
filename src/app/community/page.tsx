"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";

export default function CommunityPage() {
  const { user } = useUser();
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);

  const communityFeed = useQuery(api.prompts.getCommunityFeed, { limit: 50 });
  const userPrompts = useQuery(
    api.prompts.getPromptHistory,
    user ? { userId: user.id } : "skip"
  );
  const postToCommunity = useMutation(api.prompts.postToCommunity);
  const toggleLike = useMutation(api.prompts.toggleCommunityLike);

  const handleSharePrompt = async (prompt: any) => {
    if (!user) return;

    try {
      await postToCommunity({
        userId: user.id,
        userName: user.fullName || user.username || "Anonymous",
        userAvatar: user.imageUrl,
        originalPrompt: prompt.originalPrompt,
        optimizedPrompt: prompt.optimizedPrompt,
        settings: prompt.settings,
        scoreImprovement: prompt.scoreImprovement,
      });
      setShowShareModal(false);
      setSelectedPrompt(null);
    } catch (error) {
      console.error("Failed to share prompt:", error);
    }
  };

  const handleToggleLike = async (postId: Id<"communityPrompts">) => {
    if (!user) return;
    try {
      await toggleLike({ postId, userId: user.id });
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <Card className="bg-zinc-900 border-zinc-800 p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">🌍 Join the Community</h1>
          <p className="text-zinc-400 mb-6">
            Sign in to share your optimized prompts and discover what others are creating!
          </p>
          <Link href="/sign-in">
            <Button className="w-full">Sign In</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold">🌍 Community Feed</h1>
            <Link href="/app">
              <Button variant="outline" size="sm">
                ← Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-sm text-zinc-500">Discover and share optimized prompts</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Share Prompt Button */}
        <Card className="bg-zinc-900 border-zinc-800 p-4">
          <Button
            onClick={() => setShowShareModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            ✨ Share a Prompt
          </Button>
        </Card>

        {/* Share Modal */}
        {showShareModal && (
          <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Select a prompt to share</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedPrompt(null);
                }}
              >
                Cancel
              </Button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {userPrompts?.map((prompt) => (
                <div
                  key={prompt._id}
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPrompt?._id === prompt._id
                      ? "border-blue-500 bg-blue-950/20"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-950"
                  }`}
                >
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {prompt.originalPrompt}
                  </p>
                  {prompt.scoreImprovement && (
                    <Badge className="mt-2 bg-green-950 text-green-400 border-green-900">
                      +{prompt.scoreImprovement.toFixed(1)} improvement
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            {selectedPrompt && (
              <Button
                onClick={() => handleSharePrompt(selectedPrompt)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Share to Community
              </Button>
            )}
          </Card>
        )}

        {/* Community Feed */}
        {communityFeed?.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
            <p className="text-zinc-400">
              No posts yet. Be the first to share a prompt! 🚀
            </p>
          </Card>
        ) : (
          communityFeed?.map((post) => (
            <Card
              key={post._id}
              className="bg-zinc-900 border-zinc-800 p-4 hover:border-zinc-700 transition-all"
            >
              {/* User Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {post.userAvatar ? (
                    <img
                      src={post.userAvatar}
                      alt={post.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    post.userName[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{post.userName}</span>
                    <span className="text-zinc-500 text-sm">
                      · {formatTimestamp(post.timestamp)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-zinc-800 text-zinc-300 text-xs">
                      {post.settings.targetModel}
                    </Badge>
                    <Badge className="bg-zinc-800 text-zinc-300 text-xs">
                      {post.settings.tone}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3 ml-15">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Original Prompt</div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-sm">
                    {post.originalPrompt}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1 flex items-center gap-2">
                    Optimized Prompt
                    {post.scoreImprovement && (
                      <Badge className="bg-green-950 text-green-400 border-green-900 text-xs">
                        +{post.scoreImprovement.toFixed(1)} score
                      </Badge>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-blue-950/20 to-purple-950/20 p-3 rounded-lg border border-blue-900/30 text-sm">
                    {post.optimizedPrompt}
                  </div>
                </div>
              </div>

              {/* Engagement Bar */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-800 ml-15">
                <button
                  onClick={() => handleToggleLike(post._id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    post.likes.includes(user.id)
                      ? "text-red-500"
                      : "text-zinc-500 hover:text-red-400"
                  }`}
                >
                  <span className="text-lg">
                    {post.likes.includes(user.id) ? "❤️" : "🤍"}
                  </span>
                  <span>{post.likeCount}</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(post.optimizedPrompt);
                  }}
                  className="flex items-center gap-2 text-sm text-zinc-500 hover:text-blue-400 transition-colors"
                >
                  <span className="text-lg">📋</span>
                  <span>Copy</span>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
