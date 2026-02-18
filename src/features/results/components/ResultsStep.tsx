import { useEffect, useMemo, useState } from "react";

import { useDraft } from "../../decision/state/DraftProvider";
import { AdaptiveVisual } from "./AdaptiveVisual";
import { ExplainabilityControls } from "./ExplainabilityControls";
import { MethodCheckPanel } from "./MethodCheckPanel";
import { RankingTable } from "./RankingTable";
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
  const [whyRawInputs, setWhyRawInputs] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

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

  const activeRankingRow =
    projection.rankingRows.find((row) => row.optionId === interactionOptionId) ??
    projection.rankingRows[0] ??
    null;

  return (
    <section className="results-step" aria-labelledby="results-step-heading">
      <div className="results-step__header-controls-row">
        <div className="results-step__ranking-header-wrap">
          <RankingTable.Header
            method="wsm"
          />
        </div>

        <div
          className="results-step__controls-popover-wrap"
          onMouseEnter={() => setControlsOpen(true)}
          onMouseLeave={() => setControlsOpen(false)}
        >
          <button
            type="button"
            className="results-step__controls-trigger"
            aria-expanded={controlsOpen}
          >
            Controls
          </button>

          {controlsOpen ? (
            <div className="results-step__controls-popover" role="dialog" aria-label="Explainability controls">
              <div className="results-step__controls-content">
                <h4>Results and explainability</h4>
                <p>
                  WSM stays primary for decision flow while strict-check WPM remains a secondary
                  verification lens.
                </p>
                <ExplainabilityControls
                  hasMeasuredCriteria={projection.hasMeasuredCriteria}
                  focusModeEnabled={focusModeEnabled}
                  showRawInputs={showRawInputs}
                  focusedOptionId={focusedOptionId}
                  onFocusModeChange={setFocusModeEnabled}
                  onShowRawInputsChange={setShowRawInputs}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="results-step__table-wrap">
        <RankingTable.Table
          rows={projection.rankingRows}
          highlightedOptionId={interactionOptionId}
          onOptionHover={setHighlightedOptionId}
          onOptionFocus={(optionId: string | null) => {
            if (focusModeEnabled) {
              setFocusedOptionId(optionId);
            }
            setHighlightedOptionId(optionId);
          }}
        />
      </div>

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
          showRawInputs={whyRawInputs}
          onShowRawInputsChange={setWhyRawInputs}
          activeRankingRow={activeRankingRow}
        />
      </div>

      <MethodCheckPanel
        methodCheck={projection.methodCheck}
        highlightedOptionId={interactionOptionId}
        onOptionHover={setHighlightedOptionId}
        onOptionFocus={(optionId) => {
          if (focusModeEnabled) {
            setFocusedOptionId(optionId);
          }
          setHighlightedOptionId(optionId);
        }}
      />
    </section>
  );
};
