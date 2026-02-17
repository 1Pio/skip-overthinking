import type { Dispatch, KeyboardEvent } from "react";
import { useMemo, useState } from "react";

import type { DraftAction } from "../../decision/state/draft.reducer";
import type { DraftCriterion } from "../../criteria/state/criterion.types";
import type { DraftOption } from "../../options/state/option.types";
import { criterionWeightUpdated } from "../state/rating.actions";
import {
  selectCriterionBlankRateDiagnostics,
  selectOptionWeightedCoverage,
  selectWeightAssignmentStatus,
} from "../state/rating.selectors";
import {
  DEFAULT_CRITERION_WEIGHT,
  type CriterionWeights,
  type RatingInputMode,
  type RatingsMatrix,
} from "../state/rating.types";

type WeightsCoveragePanelProps = {
  options: DraftOption[];
  criteria: DraftCriterion[];
  matrix: RatingsMatrix;
  criterionWeights: CriterionWeights;
  ratingInputMode: RatingInputMode;
  dispatch: Dispatch<DraftAction>;
};

const toPercent = (ratio: number): string => `${Math.round(ratio * 100)}%`;

const preventNonIntegerKeys = (event: KeyboardEvent<HTMLInputElement>) => {
  if ([".", ",", "e", "E", "+", "-"].includes(event.key)) {
    event.preventDefault();
  }
};

export const WeightsCoveragePanel = ({
  options,
  criteria,
  matrix,
  criterionWeights,
  ratingInputMode,
  dispatch,
}: WeightsCoveragePanelProps) => {
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  const orderedOptions = useMemo(
    () => [...options].sort((left, right) => left.order - right.order),
    [options],
  );
  const orderedCriteria = useMemo(
    () => [...criteria].sort((left, right) => left.order - right.order),
    [criteria],
  );

  const weightStatus = useMemo(
    () => selectWeightAssignmentStatus(orderedCriteria, criterionWeights),
    [orderedCriteria, criterionWeights],
  );

  const optionCoverage = useMemo(
    () =>
      selectOptionWeightedCoverage(
        orderedOptions,
        orderedCriteria,
        matrix,
        criterionWeights,
        ratingInputMode,
      ),
    [orderedOptions, orderedCriteria, matrix, criterionWeights, ratingInputMode],
  );

  const criterionDiagnostics = useMemo(
    () =>
      selectCriterionBlankRateDiagnostics(orderedOptions, orderedCriteria, matrix, ratingInputMode),
    [orderedOptions, orderedCriteria, matrix, ratingInputMode],
  );

  const warningCount = optionCoverage.filter((entry) => entry.severity !== "ok").length;
  const blankWarningCriteria = criterionDiagnostics.filter((entry) => entry.isSoftWarning);

  return (
    <aside className="weights-coverage-panel" aria-label="Weights and coverage status">
      <header className="weights-coverage-panel__summary">
        <div>
          <h4>Weights and coverage</h4>
          <p className="weights-coverage-panel__status">
            Weights assigned: <strong>{weightStatus.assignedCount}</strong>/{weightStatus.totalCriteria}
          </p>
          {!weightStatus.isComplete ? (
            <p role="status" className="weights-coverage-panel__warning">
              Every criterion starts at 1. Add or restore any missing integer weight before
              results.
            </p>
          ) : (
            <p role="status" className="weights-coverage-panel__ok">
              All criteria have integer weights. Tune them to reflect relative importance.
            </p>
          )}
        </div>

        <div className="weights-coverage-panel__summary-actions">
          <p className="weights-coverage-panel__coverage-overview">
            Option coverage warnings: <strong>{warningCount}</strong>
          </p>
          <button type="button" onClick={() => setIsDiagnosticsOpen((value) => !value)}>
            {isDiagnosticsOpen ? "Hide diagnostics" : "Show diagnostics"}
          </button>
        </div>

        <ul className="weights-coverage-panel__option-list">
          {orderedOptions.map((option) => {
            const coverage = optionCoverage.find((entry) => entry.optionId === option.id);
            if (!coverage) {
              return null;
            }

            return (
              <li key={option.id} data-severity={coverage.severity}>
                <span>{option.title}</span>
                <strong>{coverage.coveragePercent}%</strong>
                <span>
                  {coverage.severity === "strong_warning"
                    ? "Strong warning (<50%)"
                    : coverage.severity === "warning"
                      ? "Warning (<70%)"
                      : "OK"}
                </span>
              </li>
            );
          })}
        </ul>
      </header>

      <section className="weights-coverage-panel__weights" aria-label="Criterion weight inputs">
        <h5>Criterion weights (integers only)</h5>
        <p className="weights-coverage-panel__weight-hint">
          Every criterion starts at 1. Adjust these to reflect what matters most.
        </p>
        <ul className="weights-coverage-panel__weights-list">
          {orderedCriteria.map((criterion) => {
            const currentWeight = criterionWeights[criterion.id];
            const resolvedWeight =
              typeof currentWeight === "number" &&
              Number.isInteger(currentWeight) &&
              currentWeight >= DEFAULT_CRITERION_WEIGHT
                ? currentWeight
                : DEFAULT_CRITERION_WEIGHT;

            return (
              <li key={criterion.id}>
                <label htmlFor={`criterion-weight-${criterion.id}`}>
                  <span className="weights-coverage-panel__criterion-title">{criterion.title}</span>
                  <span className="weights-coverage-panel__criterion-type">
                    {criterion.type === "rating_1_20" ? "1-20" : "Measured"}
                  </span>
                </label>
                <input
                  id={`criterion-weight-${criterion.id}`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={String(resolvedWeight)}
                  onKeyDown={preventNonIntegerKeys}
                  onChange={(event) => {
                    const nextValue = event.currentTarget.value;

                    if (nextValue === "") {
                      dispatch(
                        criterionWeightUpdated(criterionWeights, {
                          criterionId: criterion.id,
                          weight: DEFAULT_CRITERION_WEIGHT,
                        }),
                      );
                      return;
                    }

                    if (!/^\d+$/.test(nextValue)) {
                      return;
                    }

                    const parsed = Number(nextValue);
                    dispatch(
                      criterionWeightUpdated(criterionWeights, {
                        criterionId: criterion.id,
                        weight: parsed,
                      }),
                    );
                  }}
                  aria-label={`${criterion.title} weight`}
                />
              </li>
            );
          })}
        </ul>
      </section>

      {isDiagnosticsOpen ? (
        <section className="weights-coverage-panel__details" aria-label="Coverage warning details">
          <h5>Coverage diagnostics</h5>
          <p>
            Option weighted coverage warnings trigger below 70%. Strong warnings trigger below 50%.
          </p>
          {blankWarningCriteria.length > 0 ? (
            <ul className="weights-coverage-panel__criterion-warnings">
              {blankWarningCriteria.map((entry) => {
                const criterion = orderedCriteria.find((item) => item.id === entry.criterionId);
                if (!criterion) {
                  return null;
                }

                return (
                  <li key={criterion.id}>
                    <strong>{criterion.title}</strong> has {entry.blanks}/{entry.totalOptions} blanks (
                    {toPercent(entry.blankRate)}). Review this criterion before results.
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="weights-coverage-panel__ok">
              No criterion currently exceeds the soft blank-rate warning threshold.
            </p>
          )}
        </section>
      ) : null}
    </aside>
  );
};
