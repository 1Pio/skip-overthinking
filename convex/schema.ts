import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Mirrors DraftOption from src/features/options/state/option.types.ts
const optionSchema = v.object({
    id: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    icon: v.optional(v.string()),
});

// Mirrors the discriminated union from src/features/criteria/criteria.schema.ts
const ratingCriterionSchema = v.object({
    id: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    type: v.literal("rating_1_20"),
});

const numericMeasuredCriterionSchema = v.object({
    id: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    type: v.literal("numeric_measured"),
    rawDirection: v.union(v.literal("lower_raw_better"), v.literal("higher_raw_better")),
    unit: v.optional(v.string()),
});

const criterionSchema = v.union(
    ratingCriterionSchema,
    numericMeasuredCriterionSchema
);

// Mirrors RatingMatrixCell from src/features/ratings/ratings.schema.ts
const rating120CellSchema = v.object({
    criterionType: v.literal("rating_1_20"),
    numericValue: v.optional(v.number()),
    sevenLevelValue: v.optional(v.string()),
    lastEditedMode: v.optional(v.union(v.literal("numeric"), v.literal("seven_level"))),
});

const numericMeasuredCellSchema = v.object({
    criterionType: v.literal("numeric_measured"),
    rawValue: v.optional(v.number()),
});

const ratingMatrixCellSchema = v.union(
    rating120CellSchema,
    numericMeasuredCellSchema
);

export default defineSchema({
    users: authTables.users,
    authSessions: authTables.authSessions,
    authAccounts: defineTable({
        emailVerified: v.optional(v.string()),
        phoneVerified: v.optional(v.string()),
        provider: v.string(),
        providerAccountId: v.optional(v.string()),
        secret: v.optional(v.string()),
        userId: v.id("users"),
    }).index("by_userId", ["userId"]).index("userIdAndProvider", ["userId", "provider"]),
    decisions: defineTable({
        userId: v.id("users"),
        title: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        options: v.array(optionSchema),
        criteria: v.array(criterionSchema),
        ratingsMatrix: v.record(v.string(), ratingMatrixCellSchema),
        ratingInputMode: v.union(v.literal("numeric"), v.literal("seven_level")),
        criterionWeights: v.record(v.string(), v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_userId", ["userId"])
        .index("by_userId_and_createdAt", ["userId", "createdAt"]),
});
