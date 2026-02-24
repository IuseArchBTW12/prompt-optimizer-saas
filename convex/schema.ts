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
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_likes", ["likeCount"])
    .index("by_user", ["userId"]),
});
