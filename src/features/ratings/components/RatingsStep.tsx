import { useMemo, useState } from "react";

import { useDraft } from "../../decision/state/DraftProvider";
import { ratingMissingNeutralFillApplied } from "../state/rating.actions";
import {
  selectMissingRatings,
  selectRatingsCompletion,
  selectWeightAssignmentStatus,
} from "../state/rating.selectors";
import { FillMissingReviewPanel } from "./FillMissingReviewPanel";
import { createRatingModeAction, RatingModeToggle } from "./RatingModeToggle";
import { RatingsMatrix } from "./RatingsMatrix";
import { WeightsCoveragePanel } from "./WeightsCoveragePanel";

type RatingsStepProps = {
  onContinue: () => void;
  guardMessage?: string;
};

const incompleteMessage =
  "You can continue with blanks, but missing cells stay explicit until you fill them deliberately.";

export const RatingsStep = ({ onContinue, guardMessage }: RatingsStepProps) => {
  const {
    draft: { options, criteria, ratingsMatrix, ratingInputMode, criterionWeights },
    dispatch,
  } = useDraft();
  const [isFillReviewOpen, setIsFillReviewOpen] = useState(false);

  const completion = useMemo(
    () => selectRatingsCompletion(options, criteria, ratingsMatrix, ratingInputMode),
    [options, criteria, ratingsMatrix, ratingInputMode],
  );

  const fillReviewItems = useMemo(
    () =>
      selectMissingRatings(options, criteria, ratingsMatrix, ratingInputMode).filter(
        (item) => item.criterionType === "rating_1_20",
      ),
    [options, criteria, ratingsMatrix, ratingInputMode],
  );

  const weightStatus = useMemo(
    () => selectWeightAssignmentStatus(criteria, criterionWeights),
    [criteria, criterionWeights],
  );

  const handleApplyFillMissing = () => {
    dispatch(ratingMissingNeutralFillApplied(ratingsMatrix, options, criteria, ratingInputMode));
    setIsFillReviewOpen(false);
  };

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

      <WeightsCoveragePanel
        options={options}
        criteria={criteria}
        matrix={ratingsMatrix}
        criterionWeights={criterionWeights}
        ratingInputMode={ratingInputMode}
        dispatch={dispatch}
      />

      <FillMissingReviewPanel
        reviewItems={fillReviewItems}
        options={options}
        criteria={criteria}
        isOpen={isFillReviewOpen}
        onOpen={() => setIsFillReviewOpen(true)}
        onCancel={() => setIsFillReviewOpen(false)}
        onApply={handleApplyFillMissing}
      />

      <div className="ratings-step__footer">
        <button type="button" onClick={onContinue} disabled={!weightStatus.isComplete}>
          Continue to results
        </button>
        {!weightStatus.isComplete ? (
          <p role="alert" className="ratings-step__hint">
            Assign integer weights for every criterion, then review low-coverage warnings before
            continuing to results.
          </p>
        ) : completion.missingCount > 0 ? (
          <p role="status" className="ratings-step__hint">
            {incompleteMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
};
