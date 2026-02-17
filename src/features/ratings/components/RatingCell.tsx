import type { Dispatch } from "react";

import type { DraftAction } from "../../decision/state/draft.reducer";
import type { DraftCriterion } from "../../criteria/state/criterion.types";
import type { DraftOption } from "../../options/state/option.types";
import {
  numericMeasuredCellUpdated,
  rating120NumericCellUpdated,
  rating120SevenLevelCellUpdated,
} from "../state/rating.actions";
import { selectCellDesirability } from "../state/rating.selectors";
import type {
  RatingInputMode,
  RatingsMatrix,
  SevenLevelValue,
} from "../state/rating.types";

type RatingCellProps = {
  option: DraftOption;
  criterion: DraftCriterion;
  options: DraftOption[];
  criteria: DraftCriterion[];
  matrix: RatingsMatrix;
  mode: RatingInputMode;
  dispatch: Dispatch<DraftAction>;
};

const sevenLevelOptions: Array<{ value: SevenLevelValue; label: string }> = [
  { value: "terrible", label: "Terrible" },
  { value: "very_poor", label: "Very poor" },
  { value: "poor", label: "Poor" },
  { value: "ok", label: "OK" },
  { value: "good", label: "Good" },
  { value: "very_good", label: "Very good" },
  { value: "excellent", label: "Excellent" },
];

const formatOneDecimal = (value: number): string => value.toFixed(1);

const parseNumberInput = (input: string): number | null => {
  if (input.trim() === "") {
    return null;
  }

  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : null;
};

export const RatingCell = ({
  option,
  criterion,
  options,
  criteria,
  matrix,
  mode,
  dispatch,
}: RatingCellProps) => {
  const matrixKey = `${option.id}::${criterion.id}`;
  const cell = matrix[matrixKey];

  const isFilled =
    cell?.criterionType === "rating_1_20"
      ? cell.numericValue !== null || cell.sevenLevelValue !== null
      : cell?.criterionType === "numeric_measured"
        ? cell.rawValue !== null
        : false;

  if (criterion.type === "rating_1_20") {
    const numericValue =
      cell?.criterionType === "rating_1_20" && cell.numericValue !== null
        ? String(cell.numericValue)
        : "";
    const sevenLevelValue =
      cell?.criterionType === "rating_1_20" && cell.sevenLevelValue !== null
        ? cell.sevenLevelValue
        : "";

    const ghostText =
      mode === "numeric"
        ? sevenLevelValue
          ? `Ghost: ${sevenLevelOptions.find((entry) => entry.value === sevenLevelValue)?.label ?? sevenLevelValue}`
          : ""
        : numericValue
          ? `Ghost: ${formatOneDecimal(Number(numericValue))}`
          : "";

    return (
      <td className="ratings-matrix__cell" data-filled={isFilled}>
        {mode === "numeric" ? (
          <input
            className="ratings-input ratings-input--numeric"
            type="number"
            inputMode="decimal"
            min={1}
            max={20}
            step={0.1}
            value={numericValue}
            onChange={(event) => {
              dispatch(
                rating120NumericCellUpdated(matrix, {
                  optionId: option.id,
                  criterionId: criterion.id,
                  numericValue: parseNumberInput(event.target.value),
                }),
              );
            }}
            aria-label={`${option.title} - ${criterion.title} numeric rating`}
            placeholder=""
          />
        ) : (
          <select
            className="ratings-input ratings-input--seven"
            value={sevenLevelValue}
            onChange={(event) => {
              const nextValue = event.target.value as SevenLevelValue | "";
              dispatch(
                rating120SevenLevelCellUpdated(matrix, {
                  optionId: option.id,
                  criterionId: criterion.id,
                  sevenLevelValue: nextValue === "" ? null : nextValue,
                }),
              );
            }}
            aria-label={`${option.title} - ${criterion.title} seven-level rating`}
          >
            <option value=""> </option>
            {sevenLevelOptions.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        )}
        {ghostText ? <p className="ratings-matrix__ghost">{ghostText}</p> : null}
      </td>
    );
  }

  const rawValue =
    cell?.criterionType === "numeric_measured" && cell.rawValue !== null
      ? String(cell.rawValue)
      : "";
  const derived = selectCellDesirability(options, criteria, matrix, {
    optionId: option.id,
    criterionId: criterion.id,
    ratingInputMode: mode,
  });

  return (
    <td className="ratings-matrix__cell" data-filled={isFilled}>
      <div className="ratings-measured-cell">
        <input
          className="ratings-input ratings-input--numeric"
          type="number"
          inputMode="decimal"
          step="any"
          value={rawValue}
          onChange={(event) => {
            dispatch(
              numericMeasuredCellUpdated(matrix, {
                optionId: option.id,
                criterionId: criterion.id,
                rawValue: parseNumberInput(event.target.value),
              }),
            );
          }}
          aria-label={`${option.title} - ${criterion.title} raw measured value`}
          placeholder=""
        />
        <p className="ratings-measured-cell__derived">
          Der: {derived === null ? "--" : formatOneDecimal(derived)}
        </p>
      </div>
    </td>
  );
};
