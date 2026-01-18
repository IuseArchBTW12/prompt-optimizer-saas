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
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_and_timestamp", ["userId", "timestamp"])
    .index("by_improvement", ["userId", "scoreImprovement"]),

  usage: defineTable({
    userId: v.string(),
    count: v.number(),
    lastReset: v.number(),
    plan: v.string(),
  }).index("by_user", ["userId"]),
});
