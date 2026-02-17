import { ratingInputModeUpdated } from "../state/rating.actions";
import type { RatingInputMode } from "../state/rating.types";

type RatingModeToggleProps = {
  mode: RatingInputMode;
  onModeChange: (nextMode: RatingInputMode) => void;
};

export const RatingModeToggle = ({ mode, onModeChange }: RatingModeToggleProps) => {
  return (
    <section className="rating-mode-toggle" aria-label="Rating input mode">
      <div className="rating-mode-toggle__buttons" role="group" aria-label="Choose rating mode">
        <button
          type="button"
          className="rating-mode-toggle__button"
          data-active={mode === "numeric"}
          onClick={() => onModeChange("numeric")}
          disabled={mode === "numeric"}
        >
          Numeric 1-20
        </button>
        <button
          type="button"
          className="rating-mode-toggle__button"
          data-active={mode === "seven_level"}
          onClick={() => onModeChange("seven_level")}
          disabled={mode === "seven_level"}
        >
          Seven-level
        </button>
      </div>
      <p className="rating-mode-toggle__helper">
        Numeric lets you type any value from 1 to 20; seven-level uses fixed mapped labels.
      </p>
    </section>
  );
};

export const createRatingModeAction = (nextMode: RatingInputMode) =>
  ratingInputModeUpdated(nextMode);
