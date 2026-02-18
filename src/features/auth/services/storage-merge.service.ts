import type { LocalDecision } from "../storage/local.types";
import { generateDecisionId } from "../storage/utils";

/**
 * Result of merging local decisions into an authenticated account.
 */
export type MergeResult = {
    merged: number;
    skipped: number;
    conflicts: number;
};

/**
 * Merge local anonymous decisions into a Convex-backed account.
 *
 * @param localDecisions  - Record of local decisions to merge.
 * @param createRemote    - Callback that creates a single decision in Convex.
 *                          Returns the server-generated ID.
 *
 * If a UUID conflict is detected among locals (duplicate IDs), the local ID
 * is regenerated before being sent to the server.
 */
export async function mergeLocalToRemote(
    localDecisions: Record<string, LocalDecision>,
    createRemote: (decision: LocalDecision) => Promise<string>,
): Promise<MergeResult> {
    const entries = Object.values(localDecisions);
    const result: MergeResult = { merged: 0, skipped: 0, conflicts: 0 };

    // Deduplicate by ID — if two locals share an ID, regenerate the second
    const seenIds = new Set<string>();
    const deduped: LocalDecision[] = [];

    for (const d of entries) {
        if (seenIds.has(d.id)) {
            result.conflicts++;
            deduped.push({ ...d, id: generateDecisionId() });
        } else {
            seenIds.add(d.id);
            deduped.push(d);
        }
    }

    for (const decision of deduped) {
        try {
            await createRemote(decision);
            result.merged++;
        } catch {
            result.skipped++;
        }
    }

    return result;
}
