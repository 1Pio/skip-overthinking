export type PositivityHint = {
  match: string;
  suggestion: string;
  reason: string;
};

const positivityDictionary: PositivityHint[] = [
  {
    match: "cost",
    suggestion: "Affordability",
    reason: "Keeps scoring framed as desirable outcomes instead of expense burden.",
  },
  {
    match: "price",
    suggestion: "Value for price",
    reason: "Encourages a benefit-oriented lens while still reflecting spending tradeoffs.",
  },
  {
    match: "risk",
    suggestion: "Risk resilience",
    reason: "Preserves higher-is-better semantics without introducing invert controls.",
  },
  {
    match: "delay",
    suggestion: "Delivery speed",
    reason: "Reframes timeline concerns as positive momentum.",
  },
  {
    match: "complexity",
    suggestion: "Simplicity",
    reason: "Makes desirability intent explicit for readers and scoring.",
  },
  {
    match: "maintenance",
    suggestion: "Maintainability",
    reason: "Highlights sustainable long-term quality instead of maintenance burden.",
  },
];

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const getPositivityHint = (title: string): PositivityHint | null => {
  const normalizedTitle = title.trim().toLowerCase();
  if (!normalizedTitle) {
    return null;
  }

  return (
    positivityDictionary.find(({ match }) => {
      const expression = new RegExp(`\\b${escapeRegExp(match)}\\b`, "i");
      return expression.test(normalizedTitle);
    }) ?? null
  );
};

export const applyPositivityHint = (title: string, hint: PositivityHint): string => {
  const expression = new RegExp(`\\b${escapeRegExp(hint.match)}\\b`, "i");
  return title.replace(expression, hint.suggestion).trim();
};
