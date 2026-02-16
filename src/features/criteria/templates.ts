import type {
  CriterionDraftInput,
  NumericMeasuredCriterionDraftInput,
  RatingCriterionDraftInput,
} from "./state/criterion.types";

export type CriterionTemplateGroup = "recommended" | "measured";

export type CriterionTemplate = {
  id: string;
  group: CriterionTemplateGroup;
  label: string;
  purpose: string;
  createDraft: () => CriterionDraftInput;
};

export type CriterionTemplateSection = {
  id: CriterionTemplateGroup;
  heading: string;
  description: string;
  templates: CriterionTemplate[];
};

const createRecommendedTemplate = (
  id: string,
  label: string,
  purpose: string,
  title: string,
): CriterionTemplate => ({
  id,
  group: "recommended",
  label,
  purpose,
  createDraft: (): RatingCriterionDraftInput => ({
    type: "rating_1_20",
    title,
  }),
});

const createMeasuredTemplate = (
  id: string,
  label: string,
  purpose: string,
  draft: Omit<NumericMeasuredCriterionDraftInput, "type">,
): CriterionTemplate => ({
  id,
  group: "measured",
  label,
  purpose,
  createDraft: (): NumericMeasuredCriterionDraftInput => ({
    type: "numeric_measured",
    ...draft,
  }),
});

export const recommendedCriterionTemplates: CriterionTemplate[] = [
  createRecommendedTemplate(
    "recommended-affordability",
    "Affordability",
    "Compares how financially easy each option feels overall.",
    "Affordability",
  ),
  createRecommendedTemplate(
    "recommended-ease-of-execution",
    "Ease of execution",
    "Scores how manageable the effort is to implement and maintain.",
    "Ease of execution",
  ),
  createRecommendedTemplate(
    "recommended-confidence",
    "Confidence in outcome",
    "Captures how strongly evidence supports likely success.",
    "Confidence in outcome",
  ),
  createRecommendedTemplate(
    "recommended-strategic-fit",
    "Strategic fit",
    "Rates alignment with your long-term priorities and direction.",
    "Strategic fit",
  ),
];

export const measuredCriterionTemplates: CriterionTemplate[] = [
  createMeasuredTemplate(
    "measured-monthly-cost",
    "Monthly cost",
    "Tracks recurring spend where lower raw values convert to better desirability.",
    {
      title: "Monthly cost",
      rawDirection: "lower_raw_better",
      unit: "USD",
    },
  ),
  createMeasuredTemplate(
    "measured-time-to-value",
    "Time to value",
    "Measures how quickly value appears, rewarding fewer raw days or weeks.",
    {
      title: "Time to value",
      rawDirection: "lower_raw_better",
      unit: "days",
    },
  ),
  createMeasuredTemplate(
    "measured-revenue-impact",
    "Revenue impact",
    "Quantifies expected upside where higher raw gains should score better.",
    {
      title: "Revenue impact",
      rawDirection: "higher_raw_better",
      unit: "USD",
    },
  ),
  createMeasuredTemplate(
    "measured-capacity",
    "Capacity gained",
    "Represents output or throughput where higher raw capacity is desirable.",
    {
      title: "Capacity gained",
      rawDirection: "higher_raw_better",
      unit: "units",
    },
  ),
];

export const criterionTemplates: CriterionTemplate[] = [
  ...recommendedCriterionTemplates,
  ...measuredCriterionTemplates,
];

export const criterionTemplateSections: CriterionTemplateSection[] = [
  {
    id: "recommended",
    heading: "Recommended",
    description: "Quick desirability criteria that work for most decisions.",
    templates: recommendedCriterionTemplates,
  },
  {
    id: "measured",
    heading: "Measured",
    description: "Raw-value criteria converted into the same 1-20 desirability scale.",
    templates: measuredCriterionTemplates,
  },
];
