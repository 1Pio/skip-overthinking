import { Switch } from "@base-ui/react/switch";

type ExplainabilityControlsProps = {
  hasMeasuredCriteria: boolean;
  focusModeEnabled: boolean;
  showRawInputs: boolean;
  focusedOptionId?: string | null;
  onFocusModeChange: (enabled: boolean) => void;
  onShowRawInputsChange: (enabled: boolean) => void;
};

export const ExplainabilityControls = ({
  hasMeasuredCriteria,
  focusModeEnabled,
  showRawInputs,
  focusedOptionId = null,
  onFocusModeChange,
  onShowRawInputsChange,
}: ExplainabilityControlsProps) => {
  return (
    <section className="results-explainability-controls" aria-label="Explainability controls">
      <header>
        <h3>Explainability controls</h3>
        <p>Link table and visual interactions, then inspect why details with one shared option focus.</p>
      </header>

      <div className="results-explainability-controls__toggles">
        <label className="results-explainability-controls__toggle-row">
          <Switch.Root
            checked={focusModeEnabled}
            onCheckedChange={(checked) => onFocusModeChange(checked)}
            aria-label="Enable focus mode"
          >
            <Switch.Thumb />
          </Switch.Root>
          <span>
            <strong>Focus mode</strong>
            <small>Non-focused options use moderate dimming while one option stays emphasized.</small>
          </span>
        </label>

        {hasMeasuredCriteria ? (
          <label className="results-explainability-controls__toggle-row">
            <Switch.Root
              checked={showRawInputs}
              onCheckedChange={(checked) => onShowRawInputsChange(checked)}
              aria-label="Show measured raw inputs"
            >
              <Switch.Thumb />
            </Switch.Root>
            <span>
              <strong>Show raw measured inputs</strong>
              <small>
                Use one global toggle for raw + desirability rows across adaptive visual details and
                why breakdown content.
              </small>
            </span>
          </label>
        ) : null}
      </div>

      <div className="results-explainability-controls__focus-status" aria-live="polite">
        {focusModeEnabled && focusedOptionId ? (
          <p>
            Focused option: <strong>{focusedOptionId}</strong>
          </p>
        ) : (
          <p>Focus mode is available. Hover or focus an option to pin a comparison target.</p>
        )}
      </div>
    </section>
  );
};
