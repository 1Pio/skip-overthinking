import { useEffect, useMemo, useState } from "react";

import { BarChart, Gauge, RadarChart } from "@mui/x-charts";

import type { RankingRow } from "../state/results.types";

type AdaptiveVisualProps = {
  rows: RankingRow[];
  highlightedOptionId?: string | null;
  focusedOptionId?: string | null;
  onOptionHover?: (optionId: string | null) => void;
  onOptionFocus?: (optionId: string | null) => void;
  showRawInputs?: boolean;
};

type ViewRow = {
  optionId: string;
  optionTitle: string;
  rank: number | null;
  desirabilityByCriterion: number[];
  rawByCriterion: Array<number | null>;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

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
  row: ViewRow,
  rowIndex: number,
  rowCount: number,
  isDimmed: boolean,
): string => {
  const rankIndex = row.rank === null ? rowCount - 1 : row.rank - 1;
  const normalizedRank = rowCount > 1 ? 1 - rankIndex / (rowCount - 1) : 1;
  const hue = (rowIndex * 71 + 28) % 360;
  const lightness = clamp(46 + normalizedRank * 10, 40, 62);
  const alpha = isDimmed ? 0.42 : 0.94;

  return hslToRgba(hue, 70, lightness, alpha);
};

export const AdaptiveVisual = ({
  rows,
  highlightedOptionId = null,
  focusedOptionId = null,
  onOptionHover,
  onOptionFocus,
  showRawInputs = false,
}: AdaptiveVisualProps) => {
  const prefersReducedMotion = usePrefersReducedMotion();

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
  const activeRow = chartRows.find((row) => row.optionId === activeOptionId) ?? null;

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
      radarRows.map((row) => ({
        id: row.optionId,
        label: row.optionTitle,
        data: row.desirabilityByCriterion,
        fillArea: false,
        color: buildOptionColor(
          row,
          optionRankIndex(chartRows, row.optionId),
          chartRows.length,
          activeOptionId !== null && activeOptionId !== row.optionId,
        ),
      })),
    [activeOptionId, chartRows, radarRows],
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
          height={360}
          series={radarSeries}
          radar={{ metrics: criterionMetadata.map((criterion) => criterion.criterionTitle), max: 20 }}
          hideLegend
          highlight="none"
          skipAnimation={prefersReducedMotion}
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
                  width={220}
                  height={120}
                  value={Number.isFinite(average) ? average : 0}
                  valueMin={1}
                  valueMax={20}
                  startAngle={-110}
                  endAngle={110}
                  text={({ value }) => (typeof value === "number" ? `${value.toFixed(1)} / 20` : "--")}
                  skipAnimation={prefersReducedMotion}
                  sx={{
                    [`& .MuiGauge-valueArc`]: {
                      fill: buildOptionColor(row, rankIndex, chartRows.length, isDimmed),
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
          height={Math.max(210, chartRows.length * 46 + 90)}
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
              color: "#2563eb",
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

      {activeRow ? (
        <section className="results-adaptive-visual__detail" aria-live="polite">
          <h4>Inspecting {activeRow.optionTitle}</h4>
          <ul>
            {criterionMetadata.map((criterion, index) => {
              const desirability = activeRow.desirabilityByCriterion[index];
              const raw = activeRow.rawByCriterion[index];

              return (
                <li key={criterion.criterionId}>
                  <strong>{criterion.criterionTitle}:</strong>{" "}
                  {Number.isFinite(desirability) ? `${desirability.toFixed(1)} desirability` : "No score"}
                  {showRawInputs && raw !== null ? `, raw ${raw}` : ""}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </section>
  );
};
