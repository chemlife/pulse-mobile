// The heart rate chart's 24H / 8H / 3H / 1H window: a slice of the day's minutes, stepped back from the latest minute.

export type HrRange = "24h" | "8h" | "3h" | "1h";

export const HR_RANGES: readonly { value: HrRange; label: string; accessibilityLabel: string }[] = [
  { value: "24h", label: "24H", accessibilityLabel: "24 hours" },
  { value: "8h", label: "8H", accessibilityLabel: "8 hours" },
  { value: "3h", label: "3H", accessibilityLabel: "3 hours" },
  { value: "1h", label: "1H", accessibilityLabel: "1 hour" },
];

const HOUR = 3_600_000;
const MINUTE = 60_000;
const SPAN: Record<HrRange, number> = { "24h": 24 * HOUR, "8h": 8 * HOUR, "3h": 3 * HOUR, "1h": HOUR };

export type HrWindow<P> = {
  points: P[];
  /** Window bounds (epoch ms): `start` inclusive, `end` exclusive. */
  start: number;
  end: number;
  /** An earlier window exists within the day. */
  canBack: boolean;
  /** A later window exists (the window is not the latest). */
  canForward: boolean;
};

/**
 * The window of `range` ending `back` whole windows before the day's last minute, clamped to the day's first minute.
 * Points are the day's per-minute samples in time order; 24H is always the whole day.
 */
export function hrWindow<P extends { t: number }>(points: P[], range: HrRange, back: number): HrWindow<P> {
  const first = points[0]?.t ?? 0;
  const dayEnd = (points.at(-1)?.t ?? 0) + MINUTE;
  if (range === "24h" || !points.length) return { points, start: first, end: dayEnd, canBack: false, canForward: false };
  const span = SPAN[range];
  const end = dayEnd - back * span;
  const start = Math.max(first, end - span);
  return { points: points.filter((p) => p.t >= start && p.t < end), start, end, canBack: start > first, canForward: back > 0 };
}
