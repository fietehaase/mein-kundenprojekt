import { describe, expect, it } from "vitest";
import {
  nextScheduleVersion,
  shouldCreateInitialCurrentSchedule,
} from "./schedule-versioning";

describe("Ablaufplan-Versionierung", () => {
  it("legt nur ohne aktuelle Version einen initialen aktuellen Ablaufplan an", () => {
    expect(shouldCreateInitialCurrentSchedule(false)).toBe(true);
    expect(shouldCreateInitialCurrentSchedule(true)).toBe(false);
  });

  it("berechnet die nächste Versionsnummer aus der bisher neuesten Version", () => {
    expect(nextScheduleVersion(null)).toBe(1);
    expect(nextScheduleVersion(1)).toBe(2);
    expect(nextScheduleVersion(7)).toBe(8);
  });
});
