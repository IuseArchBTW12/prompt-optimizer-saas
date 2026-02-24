import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  prompts: defineTable({
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
    scoreImprovement: v.optional(v.number()),
    originalTokens: v.optional(v.number()),
    optimizedTokens: v.optional(v.number()),
    isFavorite: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_and_timestamp", ["userId", "timestamp"])
    .index("by_improvement", ["userId", "scoreImprovement"])
    .index("by_favorite", ["userId", "isFavorite"]),

  usage: defineTable({
    userId: v.string(),
    count: v.number(),
    lastReset: v.number(),
    plan: v.string(),
  }).index("by_user", ["userId"]),

  communityPrompts: defineTable({
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
    likes: v.array(v.string()), // Array of userIds who liked
    likeCount: v.number(),
    commentCount: v.number(),
    repostCount: v.number(),
    viewCount: v.number(),
    bookmarks: v.array(v.string()), // Array of userIds who bookmarked
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_likes", ["likeCount"])
    .index("by_user", ["userId"]),

  userProfiles: defineTable({
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    joinDate: v.number(),
    followerCount: v.number(),
    followingCount: v.number(),
    postCount: v.number(),
  }).index("by_user", ["userId"]),

  follows: defineTable({
    followerId: v.string(), // User who is following
    followingId: v.string(), // User being followed
    timestamp: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_relationship", ["followerId", "followingId"]),

  comments: defineTable({
    postId: v.id("communityPrompts"),
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    content: v.string(),
    likes: v.array(v.string()),
    likeCount: v.number(),
    timestamp: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),

  reposts: defineTable({
    postId: v.id("communityPrompts"),
    userId: v.string(),
    userName: v.string(),
    userAvatar: v.optional(v.string()),
    originalPostUserId: v.string(),
    timestamp: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),
});
