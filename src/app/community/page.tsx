"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import PageTransition from "@/components/PageTransition";

export default function CommunityPage() {
  const { user } = useUser();
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [feedType, setFeedType] = useState<"all" | "following">("all");
  const [commentingPostId, setCommentingPostId] = useState<Id<"communityPrompts"> | null>(null);
  const [commentText, setCommentText] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const allFeed = useQuery(api.prompts.getCommunityFeed, { limit: 50 });
  const followingFeed = useQuery(
    api.prompts.getFollowingFeed,
    user ? { userId: user.id, limit: 50 } : "skip"
  );
  const userPrompts = useQuery(
    api.prompts.getPromptHistory,
    user ? { userId: user.id } : "skip"
  );

  const postToCommunity = useMutation(api.prompts.postToCommunity);
  const toggleLike = useMutation(api.prompts.toggleCommunityLike);
  const toggleBookmark = useMutation(api.prompts.toggleBookmark);
  const repostPost = useMutation(api.prompts.repostPost);
  const deleteRepost = useMutation(api.prompts.deleteRepost);
  const addComment = useMutation(api.prompts.addComment);
  const incrementViews = useMutation(api.prompts.incrementViews);
  const getOrCreateProfile = useMutation(api.prompts.getOrCreateProfile);

  const communityFeed = feedType === "all" ? allFeed : followingFeed;

  useEffect(() => {
    if (user) {
      getOrCreateProfile({
        userId: user.id,
        userName: user.fullName || user.username || "Anonymous",
        userAvatar: user.imageUrl,
      });
    }
  }, [user, getOrCreateProfile]);

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

  const handleToggleBookmark = async (postId: Id<"communityPrompts">) => {
    if (!user) return;
    try {
      await toggleBookmark({ postId, userId: user.id });
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const handleRepost = async (postId: Id<"communityPrompts">) => {
    if (!user) return;
    try {
      await repostPost({
        postId,
        userId: user.id,
        userName: user.fullName || user.username || "Anonymous",
        userAvatar: user.imageUrl,
      });
    } catch (error: any) {
      if (error.message?.includes("Already reposted")) {
        await deleteRepost({ postId, userId: user.id });
      }
    }
  };

  const handleAddComment = async (postId: Id<"communityPrompts">) => {
    if (!user || !commentText.trim()) return;
    try {
      await addComment({
        postId,
        userId: user.id,
        userName: user.fullName || user.username || "Anonymous",
        userAvatar: user.imageUrl,
        content: commentText,
      });
      setCommentText("");
      setCommentingPostId(null);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleViewPost = (postId: Id<"communityPrompts">) => {
    incrementViews({ postId });
  };

  const toggleComments = (postId: string) => {
    const newSet = new Set(expandedComments);
    if (newSet.has(postId)) {
      newSet.delete(postId);
    } else {
      newSet.add(postId);
    }
    setExpandedComments(newSet);
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
    return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
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
    <PageTransition>
      <div className="min-h-screen bg-black text-white">
        <div className="flex max-w-[1280px] mx-auto">
        {/* Left Sidebar */}
        <div className="w-[275px] h-screen sticky top-0 border-r border-zinc-800 flex flex-col px-3">
          <div className="flex-1 py-2">
            <Link href="/community" className="inline-block p-3 mb-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-xl">✨</span>
              </div>
            </Link>

            <nav className="space-y-2">
              <Link href="/app">
                <button className="w-full flex items-center gap-5 px-3 py-3 rounded-full hover:bg-zinc-900 text-xl transition-colors">
                  <span className="text-2xl">🏠</span>
                  <span className="font-semibold">Dashboard</span>
                </button>
              </Link>

              <Link href="/community">
                <button className="w-full flex items-center gap-5 px-3 py-3 rounded-full bg-zinc-900 text-xl transition-colors">
                  <span className="text-2xl">🌍</span>
                  <span className="font-semibold">Community</span>
                </button>
              </Link>

              <Link href="/insights">
                <button className="w-full flex items-center gap-5 px-3 py-3 rounded-full hover:bg-zinc-900 text-xl transition-colors">
                  <span className="text-2xl">📊</span>
                  <span className="font-semibold">Insights</span>
                </button>
              </Link>

              <Link href="/history">
                <button className="w-full flex items-center gap-5 px-3 py-3 rounded-full hover:bg-zinc-900 text-xl transition-colors">
                  <span className="text-2xl">📚</span>
                  <span className="font-semibold">History</span>
                </button>
              </Link>

              <Link href={`/profile/${user.id}`}>
                <button className="w-full flex items-center gap-5 px-3 py-3 rounded-full hover:bg-zinc-900 text-xl transition-colors">
                  <span className="text-2xl">👤</span>
                  <span className="font-semibold">Profile</span>
                </button>
              </Link>

              <Link href="/account">
                <button className="w-full flex items-center gap-5 px-3 py-3 rounded-full hover:bg-zinc-900 text-xl transition-colors">
                  <span className="text-2xl">⚙️</span>
                  <span className="font-semibold">Settings</span>
                </button>
              </Link>
            </nav>
          </div>

          <div className="pb-4">
            <Button
              onClick={() => setShowShareModal(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 rounded-full py-6 text-lg font-bold"
            >
              Share Prompt
            </Button>
          </div>
        </div>

        {/* Center Feed */}
        <div className="flex-1 max-w-[600px] border-r border-zinc-800">
          {/* Header with Tabs */}
          <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-zinc-800">
            <div className="flex">
              <button
                onClick={() => setFeedType("all")}
                className={`flex-1 py-4 font-semibold hover:bg-zinc-900/50 transition-colors relative ${
                  feedType === "all" ? "font-bold" : "text-zinc-500"
                }`}
              >
                For you
                {feedType === "all" && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setFeedType("following")}
                className={`flex-1 py-4 font-semibold hover:bg-zinc-900/50 transition-colors relative ${
                  feedType === "following" ? "font-bold" : "text-zinc-500"
                }`}
              >
                Following
                {feedType === "following" && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-blue-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Share Modal */}
          {showShareModal && (
            <div className="border-b border-zinc-800 p-4 bg-zinc-950">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Select a prompt to share</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowShareModal(false);
                    setSelectedPrompt(null);
                  }}
                >
                  ✕
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
                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-900"
                    }`}
                  >
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {prompt.originalPrompt}
                    </p>
                    {prompt.scoreImprovement && (
                      <Badge className="mt-2 bg-green-950 text-green-400 border-green-900 text-xs">
                        +{prompt.scoreImprovement.toFixed(1)} improvement
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              {selectedPrompt && (
                <Button
                  onClick={() => handleSharePrompt(selectedPrompt)}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Share to Community
                </Button>
              )}
            </div>
          )}

          {/* Feed */}
          <div>
            {communityFeed?.length === 0 ? (
              <div className="p-8 text-center border-b border-zinc-800">
                <p className="text-zinc-400">
                  {feedType === "following"
                    ? "Follow users to see their posts here!"
                    : "No posts yet. Be the first to share! 🚀"}
                </p>
              </div>
            ) : (
              communityFeed?.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  user={user}
                  onLike={handleToggleLike}
                  onBookmark={handleToggleBookmark}
                  onRepost={handleRepost}
                  onComment={(postId: Id<"communityPrompts">) => setCommentingPostId(postId)}
                  commentingPostId={commentingPostId}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  onSubmitComment={handleAddComment}
                  onCancelComment={() => {
                    setCommentingPostId(null);
                    setCommentText("");
                  }}
                  formatTimestamp={formatTimestamp}
                  onViewPost={handleViewPost}
                  expandedComments={expandedComments}
                  toggleComments={toggleComments}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[350px] px-6 py-2">
          {/* Search */}
          <div className="sticky top-0 pt-2 pb-4 bg-black">
            <div className="bg-zinc-900 rounded-full px-4 py-3 flex items-center gap-3">
              <span className="text-zinc-500">🔍</span>
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none flex-1 text-sm"
              />
            </div>
          </div>

          {/* Subscribe Card */}
          <div className="bg-zinc-900 rounded-2xl p-4 mb-4">
            <h3 className="text-xl font-bold mb-2">Subscribe to Pro</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Unlock unlimited optimizations and advanced features.
            </p>
            <Link href="/pricing">
              <Button className="bg-blue-500 hover:bg-blue-600 rounded-full font-bold">
                Subscribe
              </Button>
            </Link>
          </div>

          {/* Trending */}
          <div className="bg-zinc-900 rounded-2xl overflow-hidden">
            <h2 className="px-4 py-3 text-xl font-bold">What's happening</h2>
            <div className="divide-y divide-zinc-800">
              <div className="px-4 py-3 hover:bg-zinc-800/50 cursor-pointer transition-colors">
                <div className="text-xs text-zinc-500 mb-1">Trending in Tech</div>
                <div className="font-bold text-sm">AI Prompts</div>
                <div className="text-xs text-zinc-500">1.2K posts</div>
              </div>
              <div className="px-4 py-3 hover:bg-zinc-800/50 cursor-pointer transition-colors">
                <div className="text-xs text-zinc-500 mb-1">Development</div>
                <div className="font-bold text-sm">Prompt Engineering</div>
                <div className="text-xs text-zinc-500">856 posts</div>
              </div>
              <div className="px-4 py-3 hover:bg-zinc-800/50 cursor-pointer transition-colors">
                <div className="text-xs text-zinc-500 mb-1">Trending</div>
                <div className="font-bold text-sm">Code Review</div>
                <div className="text-xs text-zinc-500">623 posts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PageTransition>
  );
}

function PostCard({
  post,
  user,
  onLike,
  onBookmark,
  onRepost,
  onComment,
  commentingPostId,
  commentText,
  setCommentText,
  onSubmitComment,
  onCancelComment,
  formatTimestamp,
  onViewPost,
  expandedComments,
  toggleComments,
}: any) {
  const comments = useQuery(
    api.prompts.getComments,
    expandedComments.has(post._id) ? { postId: post._id } : "skip"
  );
  const hasReposted = useQuery(
    api.prompts.hasReposted,
    user ? { postId: post._id, userId: user.id } : "skip"
  );

  useEffect(() => {
    onViewPost(post._id);
  }, []);

  return (
    <article className="border-b border-zinc-800 p-4 hover:bg-zinc-950/50 transition-colors cursor-pointer">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/profile/${post.userId}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0 hover:opacity-80 transition-opacity">
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
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 mb-1">
            <Link href={`/profile/${post.userId}`}>
              <span className="font-bold hover:underline">{post.userName}</span>
            </Link>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-500 text-sm">{formatTimestamp(post.timestamp)}</span>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="text-sm">
              <p className="mb-2 text-zinc-400">Original:</p>
              <p className="mb-3">{post.originalPrompt}</p>

              {/* Optimized Quote Card */}
              <div className="border border-zinc-800 rounded-2xl p-3 mt-2 bg-zinc-950">
                <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500">
                  <span>✨ Optimized</span>
                  {post.scoreImprovement && (
                    <Badge className="bg-green-950 text-green-400 border-green-900 text-xs px-2 py-0">
                      +{post.scoreImprovement.toFixed(1)}
                    </Badge>
                  )}
                  <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs px-2 py-0">
                    {post.settings.targetModel}
                  </Badge>
                </div>
                <p className="text-sm">{post.optimizedPrompt}</p>
              </div>
            </div>
          </div>

          {/* Engagement Bar */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleComments(post._id);
              }}
              className="flex items-center gap-2 text-zinc-500 hover:text-blue-500 group transition-colors"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xs">{post.commentCount}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRepost(post._id);
              }}
              className={`flex items-center gap-2 group transition-colors ${
                hasReposted ? "text-green-500" : "text-zinc-500 hover:text-green-500"
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-xs">{post.repostCount}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(post._id);
              }}
              className={`flex items-center gap-2 group transition-colors ${
                post.likes.includes(user.id) ? "text-red-500" : "text-zinc-500 hover:text-red-500"
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-colors">
                {post.likes.includes(user.id) ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </div>
              <span className="text-xs">{post.likeCount}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(post._id);
              }}
              className={`flex items-center gap-2 group transition-colors ${
                post.bookmarks.includes(user.id) ? "text-blue-500" : "text-zinc-500 hover:text-blue-500"
              }`}
            >
              <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                {post.bookmarks.includes(user.id) ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                )}
              </div>
            </button>
          </div>

          {/* Comments Section */}
          {expandedComments.has(post._id) && (
            <div className="mt-4 space-y-3 border-t border-zinc-800 pt-3">
              {commentingPostId === post._id ? (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.fullName?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Post your reply"
                      className="bg-transparent border-none resize-none text-sm p-0 focus-visible:ring-0"
                      rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => onSubmitComment(post._id)} size="sm" className="rounded-full bg-blue-500 hover:bg-blue-600" disabled={!commentText.trim()}>
                        Reply
                      </Button>
                      <Button onClick={onCancelComment} size="sm" variant="ghost" className="rounded-full">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => onComment(post._id)} className="text-blue-500 hover:text-blue-400 text-sm">
                  Reply to this post
                </button>
              )}

              {comments?.map((comment) => (
                <div key={comment._id} className="flex gap-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {comment.userAvatar ? (
                      <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      comment.userName[0].toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm">{comment.userName}</span>
                      <span className="text-zinc-500 text-xs">· {formatTimestamp(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
