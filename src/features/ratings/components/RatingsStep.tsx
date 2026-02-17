import { useMemo } from "react";

import { useDraft } from "../../decision/state/DraftProvider";
import { selectRatingsCompletion } from "../state/rating.selectors";
import { createRatingModeAction, RatingModeToggle } from "./RatingModeToggle";
import { RatingsMatrix } from "./RatingsMatrix";

type RatingsStepProps = {
  onContinue: () => void;
  guardMessage?: string;
};

const incompleteMessage =
  "You can continue with blanks, but missing cells stay explicit until you fill them deliberately.";

export const RatingsStep = ({ onContinue, guardMessage }: RatingsStepProps) => {
  const {
    draft: { options, criteria, ratingsMatrix, ratingInputMode },
    dispatch,
  } = useDraft();

  const completion = useMemo(
    () => selectRatingsCompletion(options, criteria, ratingsMatrix, ratingInputMode),
    [options, criteria, ratingsMatrix, ratingInputMode],
  );

  return (
    <section aria-labelledby="ratings-step-heading" className="ratings-step">
      <div className="ratings-step__header">
        <div>
          <h3 id="ratings-step-heading">Rate each option against each criterion</h3>
          <p>
            Blank cells are intentional. Filled cells get a light tint to speed up scanning.
          </p>
          <p className="ratings-step__status">
            {completion.filledCount}/{completion.totalCells} filled, {completion.missingCount} missing
            ({completion.completionPercent}% complete)
          </p>
          {guardMessage ? <p role="alert">{guardMessage}</p> : null}
        </div>

        <RatingModeToggle
          mode={ratingInputMode}
          onModeChange={(nextMode) => dispatch(createRatingModeAction(nextMode))}
        />
      </div>

      <RatingsMatrix
        options={options}
        criteria={criteria}
        matrix={ratingsMatrix}
        mode={ratingInputMode}
        dispatch={dispatch}
      />

      <div className="ratings-step__footer">
        <button type="button" onClick={onContinue}>
          Continue to results
        </button>
        {completion.missingCount > 0 ? (
          <p role="status" className="ratings-step__hint">
            {incompleteMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
};
