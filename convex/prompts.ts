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
  },
  handler: async (ctx, args) => {
    const promptId = await ctx.db.insert("prompts", {
      ...args,
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
