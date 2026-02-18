import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const optionArg = v.object({
    id: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
});

const ratingCriterionTypeArg = v.union(
    v.object({
        kind: v.literal("rating_1_20"),
    }),
    v.object({
        kind: v.literal("numeric_measured"),
        unit: v.optional(v.string()),
        rawDirection: v.union(v.literal("lower_is_better"), v.literal("higher_is_better")),
    })
);

const criterionArg = v.object({
    id: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    type: ratingCriterionTypeArg,
    order: v.number(),
});

const ratingCellArg = v.object({
    numericValue: v.optional(v.number()),
    sevenLevelValue: v.optional(v.string()),
    rawMeasuredValue: v.optional(v.number()),
});

export const create = mutation({
    args: {
        title: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        options: v.array(optionArg),
        criteria: v.array(criterionArg),
        ratingsMatrix: v.record(v.string(), ratingCellArg),
        ratingInputMode: v.union(v.literal("numeric"), v.literal("seven_level")),
        criterionWeights: v.record(v.string(), v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const now = Date.now();
        const id = await ctx.db.insert("decisions", {
            userId,
            title: args.title,
            description: args.description,
            icon: args.icon,
            options: args.options,
            criteria: args.criteria,
            ratingsMatrix: args.ratingsMatrix,
            ratingInputMode: args.ratingInputMode,
            criterionWeights: args.criterionWeights,
            createdAt: now,
            updatedAt: now,
        });
        return id;
    },
});

export const update = mutation({
    args: {
        id: v.id("decisions"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        options: v.optional(v.array(optionArg)),
        criteria: v.optional(v.array(criterionArg)),
        ratingsMatrix: v.optional(v.record(v.string(), ratingCellArg)),
        ratingInputMode: v.optional(v.union(v.literal("numeric"), v.literal("seven_level"))),
        criterionWeights: v.optional(v.record(v.string(), v.number())),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== userId) {
            throw new Error("Decision not found");
        }

        const { id, ...updates } = args;
        const filtered = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );

        await ctx.db.patch(id, {
            ...filtered,
            updatedAt: Date.now(),
        });
        return id;
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("decisions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

export const get = query({
    args: { id: v.id("decisions") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const decision = await ctx.db.get(args.id);
        if (!decision || decision.userId !== userId) return null;
        return decision;
    },
});

export const remove = mutation({
    args: { id: v.id("decisions") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const decision = await ctx.db.get(args.id);
        if (!decision || decision.userId !== userId) {
            throw new Error("Decision not found");
        }

        await ctx.db.delete(args.id);
        return { success: true };
    },
});
