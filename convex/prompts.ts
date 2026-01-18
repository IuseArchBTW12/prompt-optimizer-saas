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
