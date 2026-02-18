import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        if (!user) return null;

        return { id: userId };
    },
});

export const deleteAccount = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Delete all user's decisions
        const decisions = await ctx.db
            .query("decisions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();

        for (const decision of decisions) {
            await ctx.db.delete(decision._id);
        }

        // Delete all user's sessions
        const sessions = await ctx.db
            .query("authSessions")
            .withIndex("userId", (q) => q.eq("userId", userId))
            .collect();

        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }

        // Delete all user's accounts
        const accounts = await ctx.db
            .query("authAccounts")
            .withIndex("userId", (q) => q.eq("userId", userId))
            .collect();

        for (const account of accounts) {
            await ctx.db.delete(account._id);
        }

        // Delete the user
        await ctx.db.delete(userId);

        return { success: true };
    },
});
