import { describe, expect, it } from "vitest";
import { hasGuestCountChanged } from "./guest-impact";

describe("hasGuestCountChanged", () => {
  it("erkennt echte Gästezahländerungen", () => {
    expect(hasGuestCountChanged(10, 11)).toBe(true);
    expect(hasGuestCountChanged(10, 9)).toBe(true);
  });

  it("ignoriert unveränderte Gästezahlen", () => {
    expect(hasGuestCountChanged(10, 10)).toBe(false);
  });
});
