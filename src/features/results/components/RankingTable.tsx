import { Award, Medal, Trophy } from "lucide-react";

import type { RankingRow } from "../state/results.types";

const oklabToLinearSrgb = (l: number, a: number, b: number): [number, number, number] => {
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l_cubed = l_ * l_ * l_;
  const m_cubed = m_ * m_ * m_;
  const s_cubed = s_ * s_ * s_;

  const r = +4.0767416621 * l_cubed - 3.3077115913 * m_cubed + 0.2309699292 * s_cubed;
  const g = -1.2684380046 * l_cubed + 2.6097574011 * m_cubed - 0.3413193965 * s_cubed;
  const b_val = -0.0041960863 * l_cubed - 0.7034186147 * m_cubed + 1.707614701 * s_cubed;

  return [r, g, b_val];
};

const linearToSrgb = (c: number): number => {
  const abs = Math.abs(c);
  if (abs > 0.0031308) {
    return (Math.sign(c) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
  }
  return 12.92 * c;
};

const oklchToRgba = (l: number, c: number, h: number, alpha: number): string => {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const [linearR, linearG, linearB] = oklabToLinearSrgb(l, a, b);

  const r = Math.round(Math.max(0, Math.min(255, linearToSrgb(linearR) * 255)));
  const g = Math.round(Math.max(0, Math.min(255, linearToSrgb(linearG) * 255)));
  const bFinal = Math.round(Math.max(0, Math.min(255, linearToSrgb(linearB) * 255)));

  return `rgba(${r}, ${g}, ${bFinal}, ${alpha})`;
};

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

const optionColor = (row: RankingRow, total: number): string => {
  const rankIndex = row.rank === null ? total - 1 : row.rank - 1;
  const t = total > 1 ? rankIndex / Math.max(1, total - 1) : 0.5;

  let hue: number;
  if (t < 0.5) {
    hue = 150 - (t / 0.5) * (150 - 95);
  } else if (t < 1) {
    hue = 95 - ((t - 0.5) / 0.5) * (95 - 25);
  } else {
    hue = 25;
  }

  const lightness = 0.78 - t * (0.78 - 0.60);
  const chroma = 0.14;

  return oklchToRgba(lightness, chroma, hue, 1);
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
      <div className="ranking-table-section__header-wrap">
        <header className="ranking-table-section__header">
          <h3>{method === "wsm" ? "Ranking (WSM default)" : "Strict-check ranking (WPM)"}</h3>
          <p>
            Compact view with rank, option color, score, and weighted coverage. Ties share rank
            numbers (for example 1, 1, 3).
          </p>
        </header>
      </div>

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
              {rows.map((row) => {
                const isHighlighted = highlightedOptionId === row.optionId;
                const swatchColor = optionColor(row, rows.length);

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

type HeaderProps = {
  method?: "wsm" | "wpm";
};

export const Header = ({ method = "wsm" }: HeaderProps) => {
  return (
    <header className="ranking-table-section__header">
      <h3>{method === "wsm" ? "Ranking (WSM default)" : "Strict-check ranking (WPM)"}</h3>
      <p>
        Compact view with rank, option color, score, and weighted coverage. Ties share rank
        numbers (for example 1, 1, 3).
      </p>
    </header>
  );
};

type TableProps = {
  rows: RankingRow[];
  method?: "wsm" | "wpm";
  highlightedOptionId?: string | null;
  onOptionHover?: (optionId: string | null) => void;
  onOptionFocus?: (optionId: string | null) => void;
};

export const Table = ({
  rows,
  method = "wsm",
  highlightedOptionId = null,
  onOptionHover,
  onOptionFocus,
}: TableProps) => {
  if (rows.length === 0) {
    return <p role="status">No ranking rows yet. Add ratings to generate scores.</p>;
  }

  return (
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
          {rows.map((row) => {
            const isHighlighted = highlightedOptionId === row.optionId;
            const swatchColor = optionColor(row, rows.length);

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
  );
};

RankingTable.Header = Header;
RankingTable.Table = Table;
