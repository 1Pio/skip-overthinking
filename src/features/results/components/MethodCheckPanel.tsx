import { useMemo, useState } from "react";

import type { MethodCheck } from "../state/results.types";

type MethodCheckPanelProps = {
  methodCheck: MethodCheck;
  highlightedOptionId?: string | null;
  onOptionHover?: (optionId: string | null) => void;
  onOptionFocus?: (optionId: string | null) => void;
};

const rankLabel = (rank: number | null): string => (rank === null ? "--" : String(rank));

export const MethodCheckPanel = ({
  methodCheck,
  highlightedOptionId = null,
  onOptionHover,
  onOptionFocus,
}: MethodCheckPanelProps) => {
  const [expanded, setExpanded] = useState(false);

  const wsmRankByOption = useMemo(
    () =>
      Object.fromEntries(
        methodCheck.wsm.rows.map((row) => [row.optionId, row.rank === null ? "--" : String(row.rank)]),
      ),
    [methodCheck.wsm.rows],
  );

  const summaryText =
    methodCheck.state === "agree"
      ? "Strict check confirms the same top option as WSM."
      : methodCheck.state === "differ"
        ? "Methods differ. Expand to compare WPM order with WSM callouts."
        : methodCheck.summary;

  return (
    <section className="method-check-panel" aria-label="Strict-check method comparison">
      <header className="method-check-panel__header">
        <div>
          <h3>Strict check (WPM)</h3>
          <p>{summaryText}</p>
        </div>
        <span className="method-check-panel__state" data-state={methodCheck.state}>
          {methodCheck.state === "agree"
            ? "Methods align"
            : methodCheck.state === "differ"
              ? "Methods differ"
              : "Need more scored data"}
        </span>
      </header>

      {methodCheck.state === "differ" ? (
        <p className="method-check-panel__difference-note">
          WSM still drives the default table. WPM gives a second perspective to inspect ties and
          sensitivity.
        </p>
      ) : null}

      {methodCheck.canExpand ? (
        <div className="method-check-panel__details">
          <button type="button" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Hide WPM detail" : "Show WPM detail"}
          </button>

          {expanded ? (
            <div className="method-check-panel__table" role="region" aria-label="Expanded WPM comparison">
              <table>
                <thead>
                  <tr>
                    <th scope="col">WPM rank</th>
                    <th scope="col">Option</th>
                    <th scope="col">WPM score</th>
                    <th scope="col">WSM callout</th>
                  </tr>
                </thead>
                <tbody>
                  {methodCheck.wpm.rows.map((row) => {
                    const isHighlighted = highlightedOptionId === row.optionId;

                    return (
                      <tr
                        key={row.optionId}
                        data-highlighted={isHighlighted}
                        onMouseEnter={() => onOptionHover?.(row.optionId)}
                        onMouseLeave={() => onOptionHover?.(null)}
                        onFocus={() => onOptionFocus?.(row.optionId)}
                        onBlur={() => onOptionFocus?.(null)}
                      >
                        <td>{rankLabel(row.rank)}</td>
                        <th scope="row">{row.optionTitle}</th>
                        <td>{row.scoreLabel}</td>
                        <td>WSM rank {wsmRankByOption[row.optionId] ?? "--"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
