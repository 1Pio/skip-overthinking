import { useEffect, useMemo, useState } from "react";

import { BarChart, Gauge, RadarChart } from "@mui/x-charts";

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

const buildOptionColor = (
  isDimmed: boolean,
  total: number,
  row: ViewRow,
): string => {
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
  const alpha = isDimmed ? 0.55 - t * 0.2 : 0.95;

  return oklchToRgba(lightness, chroma, hue, alpha);
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

  useEffect(() => {
    if (highlightedOptionId !== null) {
      setHighlightedItem({ seriesId: highlightedOptionId });
    } else {
      setHighlightedItem(null);
    }
  }, [highlightedOptionId]);

  const handleHighlightChange = (item: { seriesId: string | number } | null) => {
    setHighlightedItem(item);
    if (item?.seriesId && typeof item.seriesId === 'string') {
      onOptionHover?.(item.seriesId);
    } else {
      onOptionHover?.(null);
    }
  };

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
          onHighlightChange={handleHighlightChange}
          skipAnimation={prefersReducedMotion}
          margin={{ top: 28, right: 24, bottom: 32, left: 24 }}
          sx={{
            // default line thickness
            '& .MuiRadarSeriesPlot-area': {
              strokeWidth: 2,
            },
            // optional: make the highlighted series even thicker
            '& .MuiRadarSeriesPlot-highlighted': {
              strokeWidth: 3,
            },
            // optional: tune fade behavior (not required)
            '& .MuiRadarSeriesPlot-faded': {
              opacity: 0.45,
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
                      fill: buildOptionColor(isDimmed, chartRows.length, row),
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
