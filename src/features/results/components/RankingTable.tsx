import { Award, Medal, Trophy } from "lucide-react";

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

const optionColor = (row: RankingRow, index: number, total: number): string => {
  const rankIndex = row.rank === null ? total - 1 : row.rank - 1;
  const intensity = total > 1 ? 1 - rankIndex / Math.max(1, total - 1) : 1;
  const hue = (index * 71 + 28) % 360;
  const lightness = 44 + intensity * 14;
  return `hsl(${hue} 72% ${lightness}%)`;
};

const RankCell = ({ rank }: { rank: number | null }) => {
  if (rank === 1) {
    return <Trophy size={15} aria-label="Rank 1" color="#a16207" />;
  }
  if (rank === 2) {
    return <Medal size={15} aria-label="Rank 2" color="#475569" />;
  }
  if (rank === 3) {
    return <Award size={15} aria-label="Rank 3" color="#b45309" />;
  }
  return <>{rankLabel(rank)}</>;
};

export const RankingTable = ({
  rows,
  method = "wsm",
  highlightedOptionId = null,
  onOptionHover,
  onOptionFocus,
}: RankingTableProps) => {
  return (
    <section
      className="ranking-table-section"
      aria-label={method === "wsm" ? "WSM ranking table" : "WPM ranking table"}
    >
      <header>
        <h3>{method === "wsm" ? "Ranking (WSM default)" : "Strict-check ranking (WPM)"}</h3>
        <p>
          Compact view with rank, option color, score, and weighted coverage. Ties share rank
          numbers (for example 1, 1, 3).
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
                <th scope="col" aria-label="Option color" />
                <th scope="col">Option</th>
                <th scope="col">Score</th>
                <th scope="col">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isHighlighted = highlightedOptionId === row.optionId;
                const swatchColor = optionColor(row, index, rows.length);

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
                    <td>
                      <span className="ranking-table__rank-cell">
                        <RankCell rank={row.rank} />
                      </span>
                    </td>
                    <td>
                      <span
                        className="ranking-table__option-color"
                        style={{ backgroundColor: swatchColor }}
                        aria-hidden="true"
                      />
                    </td>
                    <th scope="row">{row.optionTitle}</th>
                    <td aria-label={scoreAria(method)}>{row.scoreLabel}</td>
                    <td>
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
