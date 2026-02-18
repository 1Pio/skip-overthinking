import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const optionSchema = v.object({
    id: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
});

const ratingCriterionTypeSchema = v.union(
    v.object({
        kind: v.literal("rating_1_20"),
    }),
    v.object({
        kind: v.literal("numeric_measured"),
        unit: v.optional(v.string()),
        rawDirection: v.union(v.literal("lower_is_better"), v.literal("higher_is_better")),
    })
);

const criterionSchema = v.object({
    id: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    type: ratingCriterionTypeSchema,
    order: v.number(),
});

const ratingCellSchema = v.object({
    numericValue: v.optional(v.number()),
    sevenLevelValue: v.optional(v.string()),
    rawMeasuredValue: v.optional(v.number()),
});

export default defineSchema({
    ...authTables,
    decisions: defineTable({
        userId: v.id("users"),
        title: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        options: v.array(optionSchema),
        criteria: v.array(criterionSchema),
        ratingsMatrix: v.record(v.string(), ratingCellSchema),
        ratingInputMode: v.union(v.literal("numeric"), v.literal("seven_level")),
        criterionWeights: v.record(v.string(), v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_userId_and_createdAt", ["userId", "createdAt"]),
});
