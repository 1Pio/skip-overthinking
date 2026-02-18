import { MethodCheckPanel } from "./MethodCheckPanel";
import { RankingTable } from "./RankingTable";
import type { MethodCheck, RankingRow } from "../state/results.types";

type ResultsSummaryPayload = {
  rankingRows: RankingRow[];
  methodCheck: MethodCheck;
};

type ResultsSummarySectionProps = {
  data: ResultsSummaryPayload;
  highlightedOptionId?: string | null;
  onOptionHover?: (optionId: string | null) => void;
  onOptionFocus?: (optionId: string | null) => void;
};

export const ResultsSummarySection = ({
  data,
  highlightedOptionId = null,
  onOptionHover,
  onOptionFocus,
}: ResultsSummarySectionProps) => {
  return (
    <section className="results-summary-section" aria-label="Results summary">
      <div className="results-summary-section__ranking-wrap">
        <RankingTable
          rows={data.rankingRows}
          method="wsm"
          highlightedOptionId={highlightedOptionId}
          onOptionHover={onOptionHover}
          onOptionFocus={onOptionFocus}
        />
      </div>

      <MethodCheckPanel
        methodCheck={data.methodCheck}
        highlightedOptionId={highlightedOptionId}
        onOptionHover={onOptionHover}
        onOptionFocus={onOptionFocus}
      />
    </section>
  );
};
