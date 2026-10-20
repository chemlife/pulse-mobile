import { describe, expect, it } from "vitest";
import { hrWindow } from "./hrWindow";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const day0 = Date.UTC(2026, 9, 20);
/** `hours` of per-minute points from the day's start. */
const minutes = (hours: number) => Array.from({ length: hours * 60 }, (_, m) => ({ t: day0 + m * MINUTE }));

describe("hrWindow", () => {
  it("24H is the whole day", () => {
    const pts = minutes(24);
    const w = hrWindow(pts, "24h", 0);
    expect(w.points).toBe(pts);
    expect([w.canBack, w.canForward]).toEqual([false, false]);
  });

  it("ends at the latest minute and steps back a whole window at a time", () => {
    const pts = minutes(10);
    const w0 = hrWindow(pts, "3h", 0);
    expect(w0.points).toHaveLength(180);
    expect(w0.points[0].t).toBe(day0 + 7 * HOUR);
    expect(w0.points.at(-1)!.t).toBe(day0 + 10 * HOUR - MINUTE);
    expect([w0.canBack, w0.canForward]).toEqual([true, false]);
    const w1 = hrWindow(pts, "3h", 1);
    expect(w1.points[0].t).toBe(day0 + 4 * HOUR);
    expect([w1.canBack, w1.canForward]).toEqual([true, true]);
  });

  it("clamps the earliest window to the day's first minute", () => {
    const w = hrWindow(minutes(10), "3h", 3);
    expect(w.start).toBe(day0);
    expect(w.points).toHaveLength(60);
    expect(w.canBack).toBe(false);
  });

  it("covers a day shorter than the window", () => {
    const w = hrWindow(minutes(2), "8h", 0);
    expect(w.points).toHaveLength(120);
    expect([w.canBack, w.canForward]).toEqual([false, false]);
  });
});
