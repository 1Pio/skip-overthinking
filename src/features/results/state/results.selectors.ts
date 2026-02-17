import type { DraftCriterion } from "../../criteria/state/criterion.types";
import type { DraftOption } from "../../options/state/option.types";
import type { RatingsMatrixSchema } from "../../ratings/ratings.schema";
import {
  selectCellDesirability,
  selectOptionWeightedCoverage,
} from "../../ratings/state/rating.selectors";
import type {
  CriterionWeights,
  RatingInputMode,
} from "../../ratings/state/rating.types";
import { RESULTS_DOMAIN_CONSTANTS } from "../results.schema";
import type {
  ContributionRow,
  MethodCheck,
  MethodCheckState,
  RankingRow,
  ResultsProjection,
} from "./results.types";

type OptionScoreComputation = {
  optionId: string;
  optionTitle: string;
  optionOrder: number;
  score: number | null;
  contributions: ContributionRow[];
  missingCriterionIds: string[];
};

const roundScore = (value: number): number => {
  const precision = RESULTS_DOMAIN_CONSTANTS.scorePrecision;
  return Number(value.toFixed(precision));
};

const scoreLabel = (value: number | null): string =>
  value === null ? "--" : value.toFixed(3);

const isTie = (a: number, b: number): boolean =>
  Math.abs(a - b) <= RESULTS_DOMAIN_CONSTANTS.tieEpsilon;

const compareRows = (a: RankingRow, b: RankingRow): number => {
  if (a.score === null && b.score === null) {
    return a.optionOrder - b.optionOrder || a.optionId.localeCompare(b.optionId);
  }

  if (a.score === null) {
    return 1;
  }

  if (b.score === null) {
    return -1;
  }

  if (!isTie(a.score, b.score)) {
    return b.score - a.score;
  }

  return a.optionOrder - b.optionOrder || a.optionId.localeCompare(b.optionId);
};

const withSharedRanks = (sortedRows: RankingRow[]): RankingRow[] => {
  let currentRank = 1;

  return sortedRows.map((row, index) => {
    if (row.score === null) {
      return {
        ...row,
        rank: null,
      };
    }

    if (index > 0) {
      const prev = sortedRows[index - 1];
      if (prev.score !== null && !isTie(prev.score, row.score)) {
        currentRank = index + 1;
      }
    }

    return {
      ...row,
      rank: currentRank,
    };
  });
};

const normalizeCriterionWeights = (
  criteria: DraftCriterion[],
  criterionWeights: CriterionWeights,
): Record<string, number> => {
  const totalWeight = criteria.reduce((sum, criterion) => {
    const weight = criterionWeights[criterion.id];
    return typeof weight === "number" ? sum + weight : sum;
  }, 0);

  if (totalWeight <= 0) {
    return criteria.reduce<Record<string, number>>((acc, criterion) => {
      acc[criterion.id] = 0;
      return acc;
    }, {});
  }

  return criteria.reduce<Record<string, number>>((acc, criterion) => {
    const weight = criterionWeights[criterion.id];
    acc[criterion.id] = typeof weight === "number" ? weight / totalWeight : 0;
    return acc;
  }, {});
};

const getRawValue = (
  matrix: RatingsMatrixSchema,
  optionId: string,
  criterion: DraftCriterion,
): number | null => {
  if (criterion.type !== "numeric_measured") {
    return null;
  }

  const key = `${optionId}::${criterion.id}`;
  const cell = matrix[key];
  if (!cell || cell.criterionType !== "numeric_measured") {
    return null;
  }

  return cell.rawValue;
};

const buildOptionScores = (
  options: DraftOption[],
  criteria: DraftCriterion[],
  matrix: RatingsMatrixSchema,
  criterionWeights: CriterionWeights,
  ratingInputMode: RatingInputMode,
): { wsm: OptionScoreComputation[]; wpm: OptionScoreComputation[] } => {
  const normalizedWeights = normalizeCriterionWeights(criteria, criterionWeights);

  const wsm: OptionScoreComputation[] = [];
  const wpm: OptionScoreComputation[] = [];

  for (const option of options) {
    const contributions: ContributionRow[] = [];
    const missingCriterionIds: string[] = [];

    let observedWeight = 0;
    let wsmWeightedTotal = 0;
    let wpmProduct = 1;

    for (const criterion of criteria) {
      const weight = normalizedWeights[criterion.id] ?? 0;
      const desirability = selectCellDesirability(options, criteria, matrix, {
        optionId: option.id,
        criterionId: criterion.id,
        ratingInputMode,
      });

      const rawValue = getRawValue(matrix, option.id, criterion);
      const missing = desirability === null;

      if (missing) {
        missingCriterionIds.push(criterion.id);
      } else {
        observedWeight += weight;
        const wsmNormalized =
          (desirability - RESULTS_DOMAIN_CONSTANTS.wsmMinInput) /
          RESULTS_DOMAIN_CONSTANTS.wsmRange;
        const wpmNormalized = desirability / RESULTS_DOMAIN_CONSTANTS.wpmDivisor;
        wsmWeightedTotal += weight * wsmNormalized;
        wpmProduct *= wpmNormalized ** weight;
      }

      contributions.push({
        criterionId: criterion.id,
        criterionTitle: criterion.title,
        criterionType: criterion.type,
        criterionWeight: criterionWeights[criterion.id] ?? 0,
        normalizedWeight: weight,
        desirability,
        rawValue,
        wsmContribution:
          desirability === null
            ? 0
            : weight *
              ((desirability - RESULTS_DOMAIN_CONSTANTS.wsmMinInput) /
                RESULTS_DOMAIN_CONSTANTS.wsmRange),
        wpmFactor:
          desirability === null
            ? 1
            : (desirability / RESULTS_DOMAIN_CONSTANTS.wpmDivisor) ** weight,
        isMissing: missing,
      });
    }

    const wsmScore =
      observedWeight > 0 ? roundScore(wsmWeightedTotal / observedWeight) : null;
    const wpmScore =
      observedWeight > 0 ? roundScore(wpmProduct ** (1 / observedWeight)) : null;

    wsm.push({
      optionId: option.id,
      optionTitle: option.title,
      optionOrder: option.order,
      score: wsmScore,
      contributions,
      missingCriterionIds,
    });

    wpm.push({
      optionId: option.id,
      optionTitle: option.title,
      optionOrder: option.order,
      score: wpmScore,
      contributions,
      missingCriterionIds,
    });
  }

  return { wsm, wpm };
};

const toRankingRows = (
  method: "wsm" | "wpm",
  computations: OptionScoreComputation[],
  coverageByOptionId: Record<string, ReturnType<typeof selectOptionWeightedCoverage>[number]>,
): RankingRow[] => {
  const rows = computations.map<RankingRow>((entry) => {
    const coverage = coverageByOptionId[entry.optionId];

    return {
      optionId: entry.optionId,
      optionTitle: entry.optionTitle,
      optionOrder: entry.optionOrder,
      rank: null,
      score: entry.score,
      scoreLabel: scoreLabel(entry.score),
      method,
      coveragePercent: coverage?.coveragePercent ?? 0,
      coverageSeverity: coverage?.severity ?? "strong_warning",
      isComplete: entry.missingCriterionIds.length === 0,
      missingCriterionIds: entry.missingCriterionIds,
      contributions: entry.contributions,
    };
  });

  rows.sort(compareRows);
  return withSharedRanks(rows);
};

const getTopRankedOptionId = (rows: RankingRow[]): string | null => {
  const firstRanked = rows.find((row) => row.rank === 1);
  return firstRanked ? firstRanked.optionId : null;
};

const getTopRankedOptionTitle = (rows: RankingRow[], optionId: string | null): string | null => {
  if (!optionId) {
    return null;
  }

  const row = rows.find((entry) => entry.optionId === optionId);
  return row ? row.optionTitle : null;
};

export const selectMethodCheck = (
  options: DraftOption[],
  criteria: DraftCriterion[],
  matrix: RatingsMatrixSchema,
  criterionWeights: CriterionWeights,
  ratingInputMode: RatingInputMode,
): MethodCheck => {
  const coverageRows = selectOptionWeightedCoverage(
    options,
    criteria,
    matrix,
    criterionWeights,
    ratingInputMode,
  );
  const coverageByOptionId = Object.fromEntries(
    coverageRows.map((entry) => [entry.optionId, entry]),
  );

  const methodScores = buildOptionScores(
    options,
    criteria,
    matrix,
    criterionWeights,
    ratingInputMode,
  );

  const wsmRows = toRankingRows("wsm", methodScores.wsm, coverageByOptionId);
  const wpmRows = toRankingRows("wpm", methodScores.wpm, coverageByOptionId);

  const wsmTopOptionId = getTopRankedOptionId(wsmRows);
  const wpmTopOptionId = getTopRankedOptionId(wpmRows);

  const haveComparableTopRows = wsmTopOptionId !== null && wpmTopOptionId !== null;
  const topChanged = haveComparableTopRows && wsmTopOptionId !== wpmTopOptionId;

  const state: MethodCheckState = !haveComparableTopRows
    ? "insufficient_data"
    : topChanged
      ? "differ"
      : "agree";

  const summary =
    state === "insufficient_data"
      ? "Strict check is unavailable until at least one option has scorable data."
      : state === "agree"
        ? "WSM and strict-check WPM agree on the top option."
        : "WSM and strict-check WPM differ for the top option.";

  return {
    state,
    summary,
    canExpand: state === "differ",
    wsm: {
      method: "wsm",
      rows: wsmRows,
      topOptionId: wsmTopOptionId,
    },
    wpm: {
      method: "wpm",
      rows: wpmRows,
      topOptionId: wpmTopOptionId,
    },
    difference: {
      topChanged: Boolean(topChanged),
      wsmTopOptionId,
      wpmTopOptionId,
      wsmTopOptionTitle: getTopRankedOptionTitle(wsmRows, wsmTopOptionId),
      wpmTopOptionTitle: getTopRankedOptionTitle(wpmRows, wpmTopOptionId),
    },
  };
};

export const selectRankingRows = (
  options: DraftOption[],
  criteria: DraftCriterion[],
  matrix: RatingsMatrixSchema,
  criterionWeights: CriterionWeights,
  ratingInputMode: RatingInputMode,
): RankingRow[] =>
  selectMethodCheck(options, criteria, matrix, criterionWeights, ratingInputMode).wsm
    .rows;

export const selectResultsProjection = (
  options: DraftOption[],
  criteria: DraftCriterion[],
  matrix: RatingsMatrixSchema,
  criterionWeights: CriterionWeights,
  ratingInputMode: RatingInputMode,
): ResultsProjection => {
  const methodCheck = selectMethodCheck(
    options,
    criteria,
    matrix,
    criterionWeights,
    ratingInputMode,
  );

  return {
    rankingRows: methodCheck.wsm.rows,
    methodCheck,
    hasMeasuredCriteria: criteria.some((criterion) => criterion.type === "numeric_measured"),
  };
};
