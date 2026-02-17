import type { RankingRow } from "../state/results.types";

type RankingTableProps = {
  rows: RankingRow[];
  method?: "wsm" | "wpm";
  highlightedOptionId?: string | null;
  onOptionHover?: (optionId: string | null) => void;
  onOptionFocus?: (optionId: string | null) => void;
};

const severityLabel: Record<RankingRow["coverageSeverity"], string> = {
  ok: "Strong",
  warning: "Partial",
  strong_warning: "Low",
};

const rankLabel = (rank: number | null): string => (rank === null ? "--" : String(rank));

const coverageLabel = (row: RankingRow): string => `${row.coveragePercent}% ${severityLabel[row.coverageSeverity]}`;

const scoreAria = (method: "wsm" | "wpm"): string =>
  method === "wsm" ? "WSM score" : "WPM score";

export const RankingTable = ({
  rows,
  method = "wsm",
  highlightedOptionId = null,
  onOptionHover,
  onOptionFocus,
}: RankingTableProps) => {
  return (
    <section aria-label={method === "wsm" ? "WSM ranking table" : "WPM ranking table"}>
      <header>
        <h3>{method === "wsm" ? "Ranking (WSM default)" : "Strict-check ranking (WPM)"}</h3>
        <p>
          Columns stay compact: rank, option, score, and weighted coverage. Ties share rank numbers
          (for example 1, 1, 3).
        </p>
      </header>

      {rows.length === 0 ? (
        <p role="status">No ranking rows yet. Add ratings to generate scores.</p>
      ) : (
        <div className="ranking-table" role="region" aria-label="Ranking rows" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th scope="col">Rank</th>
                <th scope="col">Option</th>
                <th scope="col">Score</th>
                <th scope="col">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isHighlighted = highlightedOptionId === row.optionId;

                return (
                  <tr
                    key={row.optionId}
                    data-highlighted={isHighlighted}
                    data-severity={row.coverageSeverity}
                    onMouseEnter={() => onOptionHover?.(row.optionId)}
                    onMouseLeave={() => onOptionHover?.(null)}
                    onFocus={() => onOptionFocus?.(row.optionId)}
                    onBlur={() => onOptionFocus?.(null)}
                  >
                    <td>{rankLabel(row.rank)}</td>
                    <th scope="row">{row.optionTitle}</th>
                    <td aria-label={scoreAria(method)}>{row.scoreLabel}</td>
                    <td>
                      <span className="ranking-table__coverage-percent">{row.coveragePercent}%</span>{" "}
                      <span
                        className="ranking-table__coverage-badge"
                        data-severity={row.coverageSeverity}
                        aria-label={`Coverage quality ${severityLabel[row.coverageSeverity]}`}
                      >
                        {coverageLabel(row)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
