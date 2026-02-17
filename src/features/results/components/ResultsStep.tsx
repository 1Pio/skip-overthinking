import { useEffect, useMemo, useState } from "react";

import { useDraft } from "../../decision/state/DraftProvider";
import { AdaptiveVisual } from "./AdaptiveVisual";
import { ExplainabilityControls } from "./ExplainabilityControls";
import { ResultsSummarySection } from "./ResultsSummarySection";
import { WhyBreakdownModal } from "./WhyBreakdownModal";
import { selectResultsProjection } from "../state/results.selectors";

export const ResultsStep = () => {
  const {
    draft: { options, criteria, ratingsMatrix, criterionWeights, ratingInputMode },
  } = useDraft();

  const projection = useMemo(
    () =>
      selectResultsProjection(
        options,
        criteria,
        ratingsMatrix,
        criterionWeights,
        ratingInputMode,
      ),
    [options, criteria, ratingsMatrix, criterionWeights, ratingInputMode],
  );

  const [highlightedOptionId, setHighlightedOptionId] = useState<string | null>(null);
  const [focusedOptionId, setFocusedOptionId] = useState<string | null>(null);
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [showRawInputs, setShowRawInputs] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  useEffect(() => {
    if (!focusModeEnabled) {
      setFocusedOptionId(null);
    }
  }, [focusModeEnabled]);

  useEffect(() => {
    if (projection.hasMeasuredCriteria) {
      return;
    }
    setShowRawInputs(false);
  }, [projection.hasMeasuredCriteria]);

  const interactionOptionId =
    (focusModeEnabled ? focusedOptionId : null) ?? highlightedOptionId;

  const selectedRankingRow =
    projection.rankingRows.find((row) => row.optionId === selectedOptionId) ?? null;

  return (
    <section className="results-step" aria-labelledby="results-step-heading">
      <header className="results-step__header">
        <div>
          <h3 id="results-step-heading">Results and explainability</h3>
          <p>
            WSM stays primary for decision flow while strict-check WPM remains a secondary
            verification lens.
          </p>
        </div>
      </header>

      <ResultsSummarySection
        data={projection}
        highlightedOptionId={interactionOptionId}
        onOptionHover={setHighlightedOptionId}
        onOptionFocus={(optionId) => {
          if (focusModeEnabled) {
            setFocusedOptionId(optionId);
          }
          setHighlightedOptionId(optionId);
        }}
      />

      <div className="results-step__visual-wrap" data-focus-mode={focusModeEnabled}>
        <AdaptiveVisual
          rows={projection.rankingRows}
          highlightedOptionId={highlightedOptionId}
          focusedOptionId={focusModeEnabled ? focusedOptionId : null}
          onOptionHover={setHighlightedOptionId}
          onOptionFocus={(optionId) => {
            if (focusModeEnabled) {
              setFocusedOptionId(optionId);
            }
            setHighlightedOptionId(optionId);
          }}
          showRawInputs={showRawInputs}
        />
      </div>

      <ExplainabilityControls
        hasMeasuredCriteria={projection.hasMeasuredCriteria}
        focusModeEnabled={focusModeEnabled}
        showRawInputs={showRawInputs}
        focusedOptionId={focusedOptionId}
        onFocusModeChange={setFocusModeEnabled}
        onShowRawInputsChange={setShowRawInputs}
        onClearFocus={() => setFocusedOptionId(null)}
      />

      <section className="results-step__why" aria-label="Why breakdown workflow">
        <h4>Why this rank</h4>
        <p>Select one option for a compact contribution breakdown.</p>
        <div className="results-step__why-actions" role="list" aria-label="Open why breakdown">
          {projection.rankingRows.map((row) => (
            <button
              key={row.optionId}
              type="button"
              role="listitem"
              className="results-step__why-button"
              data-active={selectedOptionId === row.optionId}
              onMouseEnter={() => setHighlightedOptionId(row.optionId)}
              onMouseLeave={() => setHighlightedOptionId(null)}
              onFocus={() => {
                setHighlightedOptionId(row.optionId);
                if (focusModeEnabled) {
                  setFocusedOptionId(row.optionId);
                }
              }}
              onBlur={() => setHighlightedOptionId(null)}
              onClick={() => setSelectedOptionId(row.optionId)}
            >
              Why {row.optionTitle}
            </button>
          ))}
        </div>
      </section>

      <WhyBreakdownModal
        open={selectedOptionId !== null}
        optionTitle={selectedRankingRow?.optionTitle ?? null}
        contributions={selectedRankingRow?.contributions ?? []}
        showRawInputs={showRawInputs}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOptionId(null);
          }
        }}
      />
    </section>
  );
};
