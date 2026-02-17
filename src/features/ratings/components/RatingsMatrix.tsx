import type { Dispatch } from "react";

import type { DraftAction } from "../../decision/state/draft.reducer";
import type { DraftCriterion } from "../../criteria/state/criterion.types";
import type { DraftOption } from "../../options/state/option.types";
import type { RatingInputMode, RatingsMatrix as RatingsMatrixState } from "../state/rating.types";
import { RatingCell } from "./RatingCell";

type RatingsMatrixProps = {
  options: DraftOption[];
  criteria: DraftCriterion[];
  matrix: RatingsMatrixState;
  mode: RatingInputMode;
  dispatch: Dispatch<DraftAction>;
};

export const RatingsMatrix = ({
  options,
  criteria,
  matrix,
  mode,
  dispatch,
}: RatingsMatrixProps) => {
  if (options.length === 0 || criteria.length === 0) {
    return <p>No matrix to show yet. Add options and criteria first.</p>;
  }

  const orderedOptions = [...options].sort((left, right) => left.order - right.order);
  const orderedCriteria = [...criteria].sort((left, right) => left.order - right.order);

  return (
    <div className="ratings-matrix" role="region" aria-label="Ratings matrix" tabIndex={0}>
      <table>
        <thead>
          <tr>
            <th scope="col" className="ratings-matrix__corner">
              Option / Criterion
            </th>
            {orderedCriteria.map((criterion) => (
              <th key={criterion.id} scope="col" className="ratings-matrix__criterion">
                <div className="ratings-matrix__criterion-title">{criterion.title}</div>
                <div className="ratings-matrix__criterion-type">
                  {criterion.type === "rating_1_20" ? "1-20" : "Measured"}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orderedOptions.map((option) => (
            <tr key={option.id}>
              <th scope="row" className="ratings-matrix__option">
                {option.title}
              </th>
              {orderedCriteria.map((criterion) => (
                <RatingCell
                  key={`${option.id}:${criterion.id}`}
                  option={option}
                  criterion={criterion}
                  options={orderedOptions}
                  criteria={orderedCriteria}
                  matrix={matrix}
                  mode={mode}
                  dispatch={dispatch}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
