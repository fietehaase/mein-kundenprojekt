import { describe, expect, it } from "vitest";
import { isActiveGuestStatus, resolveGuestStatusForCapacity } from "./waitlist";

describe("Wartelisten-Management", () => {
  it("zählt nur angemeldete und bestätigte Gäste als aktiv", () => {
    expect(isActiveGuestStatus("angemeldet")).toBe(true);
    expect(isActiveGuestStatus("bestaetigt")).toBe(true);
    expect(isActiveGuestStatus("warteliste")).toBe(false);
    expect(isActiveGuestStatus("abgesagt")).toBe(false);
  });

  it("setzt aktive Anfragen bei voller Kapazität auf Warteliste", () => {
    expect(resolveGuestStatusForCapacity("angemeldet", 10, 10)).toBe(
      "warteliste",
    );
    expect(resolveGuestStatusForCapacity("bestaetigt", 10, 9)).toBe(
      "bestaetigt",
    );
    expect(resolveGuestStatusForCapacity("abgesagt", 10, 10)).toBe("abgesagt");
  });
});
