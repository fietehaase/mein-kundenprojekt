import { describe, expect, it } from "vitest";
import { parseScheduleItemInput, parseSchedulePlanInput } from "./schedule-input";

describe("parseSchedulePlanInput", () => {
  it("validiert die Event-ID", () => {
    expect(parseSchedulePlanInput({ eventId: "7" })).toEqual({ eventId: 7 });
    expect(() => parseSchedulePlanInput({ eventId: "0" })).toThrow(
      "Event-ID ist ungültig.",
    );
  });
});

describe("parseScheduleItemInput", () => {
  it("normalisiert valide Ablaufpunkte", () => {
    const item = parseScheduleItemInput({
      ablaufplanId: "3",
      uhrzeitStart: "2026-07-10T18:00",
      uhrzeitEnde: "2026-07-10T18:30",
      bezeichnung: " Empfang ",
      verantwortlich: " Team A ",
      istPuffer: "on",
      sichtbarFuerDienstleister: "on",
    });

    expect(item.ablaufplanId).toBe(3);
    expect(item.bezeichnung).toBe("Empfang");
    expect(item.verantwortlich).toBe("Team A");
    expect(item.istPuffer).toBe(true);
    expect(item.sichtbarFuerDienstleister).toBe(true);
  });

  it("verhindert ungültige Zeiten und leere Bezeichnungen", () => {
    expect(() =>
      parseScheduleItemInput({
        ablaufplanId: "3",
        uhrzeitStart: "2026-07-10T19:00",
        uhrzeitEnde: "2026-07-10T18:30",
        bezeichnung: "Empfang",
        verantwortlich: "",
        istPuffer: null,
        sichtbarFuerDienstleister: null,
      }),
    ).toThrow("Die Endzeit darf nicht vor der Startzeit liegen.");

    expect(() =>
      parseScheduleItemInput({
        ablaufplanId: "3",
        uhrzeitStart: "2026-07-10T19:00",
        uhrzeitEnde: "",
        bezeichnung: " ",
        verantwortlich: "",
        istPuffer: null,
        sichtbarFuerDienstleister: null,
      }),
    ).toThrow("Die Bezeichnung des Ablaufpunkts ist erforderlich.");
  });
});
