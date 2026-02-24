import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save a prompt optimization
export const savePrompt = mutation({
  args: {
    userId: v.string(),
    originalPrompt: v.string(),
    optimizedPrompt: v.string(),
    settings: v.object({
      targetModel: v.string(),
      tone: v.string(),
      outputPreference: v.string(),
    }),
    explanation: v.optional(v.string()),
    originalScore: v.optional(v.number()),
    optimizedScore: v.optional(v.number()),
    originalTokens: v.optional(v.number()),
    optimizedTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const scoreImprovement = 
      args.originalScore && args.optimizedScore 
        ? args.optimizedScore - args.originalScore 
        : undefined;

    const promptId = await ctx.db.insert("prompts", {
      ...args,
      scoreImprovement,
      timestamp: Date.now(),
    });
    return promptId;
  },
});

// Get user's prompt history
export const getPromptHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(100);
    return prompts;
  },
});

// Get a specific prompt
export const getPrompt = query({
  args: { id: v.id("prompts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Delete a prompt
export const deletePrompt = mutation({
  args: { id: v.id("prompts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Track usage
export const trackUsage = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (usage) {
      // Check if we need to reset (daily reset)
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (usage.lastReset < oneDayAgo) {
        await ctx.db.patch(usage._id, {
          count: 1,
          lastReset: Date.now(),
        });
      } else {
        await ctx.db.patch(usage._id, {
          count: usage.count + 1,
        });
      }
      return usage.count + 1;
    } else {
      await ctx.db.insert("usage", {
        userId: args.userId,
        count: 1,
        lastReset: Date.now(),
        plan: "free",
      });
      return 1;
    }
  },
});

// Get usage stats
export const getUsage = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    return usage;
  },
});

// Update user plan
export const updatePlan = mutation({
  args: {
    userId: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (usage) {
      await ctx.db.patch(usage._id, {
        plan: args.plan,
      });
    } else {
      await ctx.db.insert("usage", {
        userId: args.userId,
        count: 0,
        lastReset: Date.now(),
        plan: args.plan,
      });
    }
  },
});

// Analytics: Get insights data
export const getInsights = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    // Get all prompts from last 30 days
    const allPrompts = await ctx.db
      .query("prompts")
      .withIndex("by_user_and_timestamp", (q) => 
        q.eq("userId", args.userId).gte("timestamp", thirtyDaysAgo)
      )
      .collect();

    // Most improved prompts
    const mostImproved = allPrompts
      .filter(p => p.scoreImprovement !== undefined)
      .sort((a, b) => (b.scoreImprovement || 0) - (a.scoreImprovement || 0))
      .slice(0, 5)
      .map(p => ({
        id: p._id,
        originalPrompt: p.originalPrompt.substring(0, 100) + '...',
        improvement: p.scoreImprovement,
        originalScore: p.originalScore,
        optimizedScore: p.optimizedScore,
        timestamp: p.timestamp,
      }));

    // Token savings
    const totalOriginalTokens = allPrompts.reduce((sum, p) => sum + (p.originalTokens || 0), 0);
    const totalOptimizedTokens = allPrompts.reduce((sum, p) => sum + (p.optimizedTokens || 0), 0);
    const tokenSavings = totalOriginalTokens > totalOptimizedTokens 
      ? totalOriginalTokens - totalOptimizedTokens 
      : 0;

    // Usage patterns - which settings work best
    const settingsMap = new Map<string, { count: number; avgImprovement: number; totalImprovement: number }>();
    
    allPrompts.forEach(p => {
      if (p.scoreImprovement) {
        const key = `${p.settings.targetModel}-${p.settings.tone}-${p.settings.outputPreference}`;
        const existing = settingsMap.get(key) || { count: 0, avgImprovement: 0, totalImprovement: 0 };
        settingsMap.set(key, {
          count: existing.count + 1,
          totalImprovement: existing.totalImprovement + p.scoreImprovement,
          avgImprovement: (existing.totalImprovement + p.scoreImprovement) / (existing.count + 1),
        });
      }
    });

    const bestSettings = Array.from(settingsMap.entries())
      .map(([key, data]) => {
        const [targetModel, tone, outputPreference] = key.split('-');
        return {
          targetModel,
          tone,
          outputPreference,
          count: data.count,
          avgImprovement: Math.round(data.avgImprovement * 10) / 10,
        };
      })
      .sort((a, b) => b.avgImprovement - a.avgImprovement)
      .slice(0, 5);

    // Success rate trends (prompts by day)
    const dailyStats = new Map<string, { count: number; avgImprovement: number; totalImprovement: number }>();
    
    allPrompts.forEach(p => {
      const date = new Date(p.timestamp).toISOString().split('T')[0];
      const existing = dailyStats.get(date) || { count: 0, avgImprovement: 0, totalImprovement: 0 };
      const improvement = p.scoreImprovement || 0;
      dailyStats.set(date, {
        count: existing.count + 1,
        totalImprovement: existing.totalImprovement + improvement,
        avgImprovement: (existing.totalImprovement + improvement) / (existing.count + 1),
      });
    });

    const trendData = Array.from(dailyStats.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        avgImprovement: Math.round(data.avgImprovement * 10) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Overall stats
    const totalPrompts = allPrompts.length;
    const avgImprovement = allPrompts.length > 0
      ? Math.round((allPrompts.reduce((sum, p) => sum + (p.scoreImprovement || 0), 0) / allPrompts.length) * 10) / 10
      : 0;

    return {
      mostImproved,
      tokenSavings,
      bestSettings,
      trendData,
      totalPrompts,
      avgImprovement,
      totalOriginalTokens,
      totalOptimizedTokens,
    };
  },
});

// Toggle favorite status
export const toggleFavorite = mutation({
  args: {
    promptId: v.id("prompts"),
  },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");
    
    await ctx.db.patch(args.promptId, {
      isFavorite: !prompt.isFavorite,
    });
    
    return !prompt.isFavorite;
  },
});

// Add tag to prompt
export const addTag = mutation({
  args: {
    promptId: v.id("prompts"),
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");
    
    const currentTags = prompt.tags || [];
    const normalizedTag = args.tag.toLowerCase().trim();
    
    if (!currentTags.includes(normalizedTag)) {
      await ctx.db.patch(args.promptId, {
        tags: [...currentTags, normalizedTag],
      });
    }
    
    return [...currentTags, normalizedTag];
  },
});

// Remove tag from prompt
export const removeTag = mutation({
  args: {
    promptId: v.id("prompts"),
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = await ctx.db.get(args.promptId);
    if (!prompt) throw new Error("Prompt not found");
    
    const currentTags = prompt.tags || [];
    const updatedTags = currentTags.filter(t => t !== args.tag);
    
    await ctx.db.patch(args.promptId, {
      tags: updatedTags,
    });
    
    return updatedTags;
  },
});

// Get all unique tags for a user
export const getUserTags = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const tagsSet = new Set<string>();
    prompts.forEach(prompt => {
      if (prompt.tags) {
        prompt.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    return Array.from(tagsSet).sort();
  },
});

// Get filtered prompts (by favorites, tags, search)
export const getFilteredPrompts = query({
  args: {
    userId: v.string(),
    showFavoritesOnly: v.optional(v.boolean()),
    filterTags: v.optional(v.array(v.string())),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let prompts = await ctx.db
      .query("prompts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    // Filter by favorites
    if (args.showFavoritesOnly) {
      prompts = prompts.filter(p => p.isFavorite === true);
    }
    
    // Filter by tags
    if (args.filterTags && args.filterTags.length > 0) {
      prompts = prompts.filter(p => {
        if (!p.tags) return false;
        return args.filterTags!.some(tag => p.tags!.includes(tag));
      });
    }
    
    // Filter by search query
    if (args.searchQuery && args.searchQuery.trim()) {
      const query = args.searchQuery.toLowerCase();
      prompts = prompts.filter(p => 
        p.originalPrompt.toLowerCase().includes(query) ||
        p.optimizedPrompt.toLowerCase().includes(query) ||
        (p.explanation && p.explanation.toLowerCase().includes(query)) ||
        (p.tags && p.tags.some(tag => tag.includes(query)))
      );
    }
    
    return prompts.slice(0, 100);
  },
});

// ============= COMMUNITY FEATURES =============

// Post a prompt to the community
export const postToCommunity = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    originalPrompt: v.string(),
    optimizedPrompt: v.string(),
    settings: v.object({
      targetModel: v.string(),
      tone: v.string(),
      outputPreference: v.string(),
    }),
    scoreImprovement: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("communityPrompts", {
      ...args,
      likes: [],
      likeCount: 0,
      commentCount: 0,
      repostCount: 0,
      viewCount: 0,
      bookmarks: [],
      timestamp: Date.now(),
    });
    
    // Update user profile post count
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (profile) {
      await ctx.db.patch(profile._id, {
        postCount: profile.postCount + 1,
      });
    }
    
    return postId;
  },
});

// Get community feed (all shared prompts)
export const getCommunityFeed = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const posts = await ctx.db
      .query("communityPrompts")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
    return posts;
  },
});

// Toggle like on a community post
export const toggleCommunityLike = mutation({
  args: {
    postId: v.id("communityPrompts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const hasLiked = post.likes.includes(args.userId);
    
    if (hasLiked) {
      // Remove like
      await ctx.db.patch(args.postId, {
        likes: post.likes.filter(id => id !== args.userId),
        likeCount: post.likeCount - 1,
      });
    } else {
      // Add like
      await ctx.db.patch(args.postId, {
        likes: [...post.likes, args.userId],
        likeCount: post.likeCount + 1,
      });
    }
    
    return !hasLiked; // Return new liked state
  },
});

// Get user's community posts
export const getUserCommunityPosts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("communityPrompts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
    return posts;
  },
});

// ============= PROFILE SYSTEM =============

// Get or create user profile
export const getOrCreateProfile = mutation({
  args: {
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existing) return existing;
    
    const profileId = await ctx.db.insert("userProfiles", {
      userId: args.userId,
      userName: args.userName,
      userAvatar: args.userAvatar,
      joinDate: Date.now(),
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
    });
    
    return await ctx.db.get(profileId);
  },
});

// Get user profile
export const getUserProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    return profile;
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    userId: v.string(),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!profile) throw new Error("Profile not found");
    
    await ctx.db.patch(profile._id, {
      bio: args.bio,
      location: args.location,
      website: args.website,
    });
  },
});

// ============= FOLLOW SYSTEM =============

// Follow a user
export const followUser = mutation({
  args: {
    followerId: v.string(),
    followingId: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.followerId === args.followingId) {
      throw new Error("Cannot follow yourself");
    }
    
    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_relationship", (q) => 
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();
    
    if (existing) return; // Already following
    
    // Create follow relationship
    await ctx.db.insert("follows", {
      followerId: args.followerId,
      followingId: args.followingId,
      timestamp: Date.now(),
    });
    
    // Update follower's following count
    const followerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.followerId))
      .first();
    if (followerProfile) {
      await ctx.db.patch(followerProfile._id, {
        followingCount: followerProfile.followingCount + 1,
      });
    }
    
    // Update followed user's follower count
    const followingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.followingId))
      .first();
    if (followingProfile) {
      await ctx.db.patch(followingProfile._id, {
        followerCount: followingProfile.followerCount + 1,
      });
    }
  },
});

// Unfollow a user
export const unfollowUser = mutation({
  args: {
    followerId: v.string(),
    followingId: v.string(),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_relationship", (q) => 
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();
    
    if (!follow) return; // Not following
    
    await ctx.db.delete(follow._id);
    
    // Update counts
    const followerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.followerId))
      .first();
    if (followerProfile) {
      await ctx.db.patch(followerProfile._id, {
        followingCount: Math.max(0, followerProfile.followingCount - 1),
      });
    }
    
    const followingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.followingId))
      .first();
    if (followingProfile) {
      await ctx.db.patch(followingProfile._id, {
        followerCount: Math.max(0, followingProfile.followerCount - 1),
      });
    }
  },
});

// Check if following
export const isFollowing = query({
  args: {
    followerId: v.string(),
    followingId: v.string(),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_relationship", (q) => 
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();
    return !!follow;
  },
});

// Get followers
export const getFollowers = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", args.userId))
      .collect();
    
    const followers = await Promise.all(
      follows.map(async (follow) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", follow.followerId))
          .first();
        return profile;
      })
    );
    
    return followers.filter(Boolean);
  },
});

// Get following
export const getFollowing = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();
    
    const following = await Promise.all(
      follows.map(async (follow) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_user", (q) => q.eq("userId", follow.followingId))
          .first();
        return profile;
      })
    );
    
    return following.filter(Boolean);
  },
});

// Get following feed
export const getFollowingFeed = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    // Get list of users being followed
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", args.userId))
      .collect();
    
    const followingIds = follows.map(f => f.followingId);
    
    // Get all posts
    const allPosts = await ctx.db
      .query("communityPrompts")
      .withIndex("by_timestamp")
      .order("desc")
      .take(200);
    
    // Filter to only following users' posts
    const filteredPosts = allPosts.filter(post => 
      followingIds.includes(post.userId)
    );
    
    return filteredPosts.slice(0, limit);
  },
});

// ============= COMMENTS SYSTEM =============

// Add comment
export const addComment = mutation({
  args: {
    postId: v.id("communityPrompts"),
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      userId: args.userId,
      userName: args.userName,
      userAvatar: args.userAvatar,
      content: args.content,
      likes: [],
      likeCount: 0,
      timestamp: Date.now(),
    });
    
    // Update post comment count
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        commentCount: post.commentCount + 1,
      });
    }
    
    return commentId;
  },
});

// Get comments for a post
export const getComments = query({
  args: { postId: v.id("communityPrompts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();
    return comments;
  },
});

// Toggle comment like
export const toggleCommentLike = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    const hasLiked = comment.likes.includes(args.userId);
    
    if (hasLiked) {
      await ctx.db.patch(args.commentId, {
        likes: comment.likes.filter(id => id !== args.userId),
        likeCount: comment.likeCount - 1,
      });
    } else {
      await ctx.db.patch(args.commentId, {
        likes: [...comment.likes, args.userId],
        likeCount: comment.likeCount + 1,
      });
    }
    
    return !hasLiked;
  },
});

// ============= REPOST SYSTEM =============

// Repost
export const repostPost = mutation({
  args: {
    postId: v.id("communityPrompts"),
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    
    // Check if already reposted
    const existing = await ctx.db
      .query("reposts")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    if (existing) throw new Error("Already reposted");
    
    const repostId = await ctx.db.insert("reposts", {
      postId: args.postId,
      userId: args.userId,
      userName: args.userName,
      userAvatar: args.userAvatar,
      originalPostUserId: post.userId,
      timestamp: Date.now(),
    });
    
    // Update post repost count
    await ctx.db.patch(args.postId, {
      repostCount: post.repostCount + 1,
    });
    
    return repostId;
  },
});

// Delete repost
export const deleteRepost = mutation({
  args: {
    postId: v.id("communityPrompts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const repost = await ctx.db
      .query("reposts")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    
    if (!repost) return;
    
    await ctx.db.delete(repost._id);
    
    const post = await ctx.db.get(args.postId);
    if (post) {
      await ctx.db.patch(args.postId, {
        repostCount: Math.max(0, post.repostCount - 1),
      });
    }
  },
});

// Check if user reposted
export const hasReposted = query({
  args: {
    postId: v.id("communityPrompts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const repost = await ctx.db
      .query("reposts")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
    return !!repost;
  },
});

// ============= BOOKMARKS =============

// Toggle bookmark
export const toggleBookmark = mutation({
  args: {
    postId: v.id("communityPrompts"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const hasBookmarked = post.bookmarks.includes(args.userId);
    
    if (hasBookmarked) {
      await ctx.db.patch(args.postId, {
        bookmarks: post.bookmarks.filter(id => id !== args.userId),
      });
    } else {
      await ctx.db.patch(args.postId, {
        bookmarks: [...post.bookmarks, args.userId],
      });
    }
    
    return !hasBookmarked;
  },
});

// Get bookmarked posts
export const getBookmarkedPosts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const allPosts = await ctx.db
      .query("communityPrompts")
      .withIndex("by_timestamp")
      .order("desc")
      .take(200);
    
    return allPosts.filter(post => post.bookmarks.includes(args.userId));
  },
});

// ============= VIEW TRACKING =============

// Increment views
export const incrementViews = mutation({
  args: { postId: v.id("communityPrompts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;
    
    await ctx.db.patch(args.postId, {
      viewCount: post.viewCount + 1,
    });
  },
});
