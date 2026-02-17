import { useEffect, useMemo, useState } from "react";

import { BarChart, Gauge, RadarChart } from "@mui/x-charts";

import type { RankingRow } from "../state/results.types";

type AdaptiveVisualProps = {
  rows: RankingRow[];
  activeRankingRow?: RankingRow | null;
  highlightedOptionId?: string | null;
  focusedOptionId?: string | null;
  onOptionHover?: (optionId: string | null) => void;
  onOptionFocus?: (optionId: string | null) => void;
  showRawInputs?: boolean;
  onShowRawInputsChange?: (value: boolean) => void;
};

type ViewRow = {
  optionId: string;
  optionTitle: string;
  rank: number | null;
  desirabilityByCriterion: number[];
  rawByCriterion: Array<number | null>;
};

const hslToRgba = (hue: number, saturation: number, lightness: number, alpha: number): string => {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hue >= 0 && hue < 60) {
    rPrime = c;
    gPrime = x;
  } else if (hue < 120) {
    rPrime = x;
    gPrime = c;
  } else if (hue < 180) {
    gPrime = c;
    bPrime = x;
  } else if (hue < 240) {
    gPrime = x;
    bPrime = c;
  } else if (hue < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  const r = Math.round((rPrime + m) * 255);
  const g = Math.round((gPrime + m) * 255);
  const b = Math.round((bPrime + m) * 255);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const usePrefersReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefersReducedMotion(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return prefersReducedMotion;
};

const optionRankIndex = (rows: ViewRow[], optionId: string): number => {
  const ranked = [...rows].sort((a, b) => {
    if (a.rank === null && b.rank === null) {
      return a.optionTitle.localeCompare(b.optionTitle);
    }
    if (a.rank === null) {
      return 1;
    }
    if (b.rank === null) {
      return -1;
    }
    if (a.rank !== b.rank) {
      return a.rank - b.rank;
    }
    return a.optionTitle.localeCompare(b.optionTitle);
  });

  const index = ranked.findIndex((row) => row.optionId === optionId);
  return index === -1 ? ranked.length : index;
};

const buildOptionColor = (
  rowIndex: number,
  isDimmed: boolean,
  total: number,
  row: ViewRow,
): string => {
  const rankIndex = row.rank === null ? total - 1 : row.rank - 1;
  const intensity = total > 1 ? 1 - rankIndex / Math.max(1, total - 1) : 1;
  const hue = (rowIndex * 71 + 28) % 360;
  const lightness = isDimmed ? 44 + intensity * 14 - 18 : 44 + intensity * 14;
  const saturation = isDimmed ? 72 - 15 : 72;
  const alpha = isDimmed ? 0.45 : 0.92;

  return hslToRgba(hue, saturation, lightness, alpha);
};

export const AdaptiveVisual = ({
  rows,
  activeRankingRow = null,
  highlightedOptionId = null,
  focusedOptionId = null,
  onOptionHover,
  onOptionFocus,
  showRawInputs = false,
  onShowRawInputsChange,
}: AdaptiveVisualProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [highlightedItem, setHighlightedItem] = useState<{ seriesId: string | number } | null>(null);

  const criterionMetadata = useMemo(() => {
    const firstWithContributions = rows.find((row) => row.contributions.length > 0);
    return firstWithContributions
      ? firstWithContributions.contributions.map((entry) => ({
          criterionId: entry.criterionId,
          criterionTitle: entry.criterionTitle,
        }))
      : [];
  }, [rows]);

  const chartRows = useMemo<ViewRow[]>(
    () =>
      rows.map((row) => ({
        optionId: row.optionId,
        optionTitle: row.optionTitle,
        rank: row.rank,
        desirabilityByCriterion: criterionMetadata.map((criterion) => {
          const contribution = row.contributions.find(
            (entry) => entry.criterionId === criterion.criterionId,
          );
          return contribution?.desirability ?? Number.NaN;
        }),
        rawByCriterion: criterionMetadata.map((criterion) => {
          const contribution = row.contributions.find(
            (entry) => entry.criterionId === criterion.criterionId,
          );
          return contribution?.rawValue ?? null;
        }),
      })),
    [criterionMetadata, rows],
  );

  const criteriaCount = criterionMetadata.length;
  const activeOptionId = focusedOptionId ?? highlightedOptionId ?? chartRows[0]?.optionId ?? null;
  const detailRow = activeRankingRow ?? rows.find((row) => row.optionId === activeOptionId) ?? null;

  const radarRows = useMemo(
    () =>
      [...chartRows].sort((a, b) => {
        const aRank = a.rank ?? Number.MAX_SAFE_INTEGER;
        const bRank = b.rank ?? Number.MAX_SAFE_INTEGER;
        if (aRank !== bRank) {
          return bRank - aRank;
        }
        return b.optionTitle.localeCompare(a.optionTitle);
      }),
    [chartRows],
  );

  const radarSeries = useMemo(
    () =>
      radarRows
        .filter((row) => row.desirabilityByCriterion.some((v) => Number.isFinite(v)))
        .map((row) => {
          const isDimmed = activeOptionId !== null && activeOptionId !== row.optionId;
          const isFocused = activeOptionId === row.optionId;
          const isHighlighted = highlightedItem?.seriesId === row.optionId;
          return {
            id: row.optionId,
            label: row.optionTitle,
            data: row.desirabilityByCriterion,
            fillArea: isHighlighted,
            color: buildOptionColor(
              optionRankIndex(chartRows, row.optionId),
              isDimmed,
              chartRows.length,
              row,
            ),
            lineWidth: isFocused ? 5.5 : 3.8,
          };
        }),
    [activeOptionId, chartRows, radarRows, highlightedItem],
  );

  const singleCriterionTitle = criterionMetadata[0]?.criterionTitle ?? "Criterion";

  return (
    <section
      className="results-adaptive-visual"
      aria-label="Adaptive criteria visualization"
      data-criteria-count={criteriaCount}
      onMouseLeave={() => onOptionHover?.(null)}
    >
      <header>
        <h3>Adaptive visual</h3>
        <p>
          Visual mode follows criteria count: radar for 3+, dial for 2, and comparison bar for 1.
        </p>
      </header>

      {criteriaCount === 0 || chartRows.length === 0 ? (
        <p role="status">Add scored criteria to render the adaptive visual.</p>
      ) : null}

      {criteriaCount >= 3 ? (
        <RadarChart
          className="results-adaptive-visual__radar-chart"
          height={460}
          series={radarSeries.length > 0 ? radarSeries : []}
          radar={{ metrics: criterionMetadata.map((criterion) => criterion.criterionTitle), max: 20 }}
          hideLegend
          highlight="series"
          highlightedItem={highlightedItem}
          onHighlightChange={setHighlightedItem}
          skipAnimation={prefersReducedMotion}
          margin={{ top: 28, right: 24, bottom: 32, left: 24 }}
          sx={{
            [`& .MuiRadarSeries-area`]: {
              fill: "none",
            },
            [`& .MuiChartsAxis-tickLabel`]: {
              fontSize: "0.82rem",
            },
          }}
        />
      ) : null}

      {criteriaCount === 2 ? (
        <div className="results-adaptive-visual__dial-grid" role="list" aria-label="Two-criterion dials">
          {chartRows.map((row) => {
            const average =
              row.desirabilityByCriterion.filter((value) => Number.isFinite(value)).reduce((sum, value) => sum + value, 0) /
              Math.max(1, row.desirabilityByCriterion.filter((value) => Number.isFinite(value)).length);

            const isDimmed = activeOptionId !== null && activeOptionId !== row.optionId;
            const rankIndex = optionRankIndex(chartRows, row.optionId);

            return (
              <article
                key={row.optionId}
                role="listitem"
                className="results-adaptive-visual__dial-card"
                data-dimmed={isDimmed}
                onMouseEnter={() => onOptionHover?.(row.optionId)}
                onFocus={() => onOptionFocus?.(row.optionId)}
                onBlur={() => onOptionFocus?.(null)}
                tabIndex={0}
              >
                <h4>{row.optionTitle}</h4>
                <Gauge
                  width={250}
                  height={132}
                  value={Number.isFinite(average) ? average : 0}
                  valueMin={1}
                  valueMax={20}
                  startAngle={-110}
                  endAngle={110}
                  text={({ value }) => (typeof value === "number" ? `${value.toFixed(1)} / 20` : "--")}
                  skipAnimation={prefersReducedMotion}
                  sx={{
                    [`& .MuiGauge-valueArc`]: {
                      fill: buildOptionColor(rankIndex, isDimmed, chartRows.length, row),
                    },
                  }}
                />
                <dl>
                  {criterionMetadata.map((criterion, criterionIndex) => (
                    <div key={criterion.criterionId}>
                      <dt>{criterion.criterionTitle}</dt>
                      <dd>
                        {Number.isFinite(row.desirabilityByCriterion[criterionIndex])
                          ? row.desirabilityByCriterion[criterionIndex]?.toFixed(1)
                          : "--"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          })}
        </div>
      ) : null}

      {criteriaCount === 1 ? (
        <BarChart
          height={Math.max(240, chartRows.length * 54 + 110)}
          layout="horizontal"
          yAxis={[{ scaleType: "band", data: chartRows.map((row) => row.optionTitle), width: 132 }]}
          xAxis={[{ min: 1, max: 20, label: `${singleCriterionTitle} desirability` }]}
          series={[
            {
              id: "single-criterion-comparison",
              label: singleCriterionTitle,
              data: chartRows.map((row) => {
                const value = row.desirabilityByCriterion[0];
                return Number.isFinite(value) ? value : null;
              }),
              color: "#1d4ed8",
            },
          ]}
          hideLegend
          skipAnimation={prefersReducedMotion}
        />
      ) : null}

      {chartRows.length > 0 ? (
        <div className="results-adaptive-visual__options" role="list" aria-label="Option interaction controls">
          {chartRows.map((row) => {
            const isActive = activeOptionId === row.optionId;
            const isDimmed = activeOptionId !== null && !isActive;

            return (
              <button
                key={row.optionId}
                type="button"
                role="listitem"
                data-active={isActive}
                data-dimmed={isDimmed}
                onMouseEnter={() => onOptionHover?.(row.optionId)}
                onFocus={() => onOptionFocus?.(row.optionId)}
                onBlur={() => onOptionFocus?.(null)}
              >
                {row.optionTitle}
              </button>
            );
          })}
        </div>
      ) : null}

      {detailRow ? (
        <section className="results-adaptive-visual__detail" aria-live="polite">
          <div className="results-adaptive-visual__detail-header">
            <h4>Why this option ranks here: {detailRow.optionTitle}</h4>
            {detailRow.contributions.some((c) => c.criterionType === "numeric_measured") ? (
              <label className="results-adaptive-visual__raw-toggle">
                <input
                  type="checkbox"
                  checked={showRawInputs}
                  onChange={(e) => onShowRawInputsChange?.(e.target.checked)}
                  aria-label="Show raw measured inputs"
                />
                <span>Raw</span>
              </label>
            ) : null}
          </div>
          {detailRow.contributions.length === 0 ? (
            <p role="status">No contribution rows yet.</p>
          ) : (
            <div className="results-adaptive-visual__why-table" role="region" aria-label="Contribution breakdown">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Criterion</th>
                    <th scope="col">Desirability</th>
                    {showRawInputs ? <th scope="col">Raw</th> : null}
                    <th scope="col">Weight</th>
                    <th scope="col">Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {detailRow.contributions.map((row) => (
                    <tr key={row.criterionId} data-missing={row.isMissing}>
                      <th scope="row">{row.criterionTitle}</th>
                      <td>{row.desirability === null ? "--" : row.desirability.toFixed(1)}</td>
                      {showRawInputs ? <td>{row.rawValue === null ? "--" : row.rawValue}</td> : null}
                      <td>{(row.normalizedWeight * 100).toFixed(1)}%</td>
                      <td>{row.wsmContribution.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </section>
  );
};
