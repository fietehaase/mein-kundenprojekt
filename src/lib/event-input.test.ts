import { describe, expect, it } from "vitest";
import { parseEventInput, parseEventStatus } from "./event-input";

describe("parseEventInput", () => {
  it("normalisiert valide Event-Eingaben", () => {
    const event = parseEventInput({
      name: " Sommerfest ",
      datum: "2026-07-10",
      status: "geplant",
      gaesteanzahlGeplant: "120",
      gaesteanzahlAktuell: "80",
      budgetGesamt: "15000,5",
      notizen: "  intern  ",
    });

    expect(event.name).toBe("Sommerfest");
    expect(event.status).toBe("geplant");
    expect(event.gaesteanzahlGeplant).toBe(120);
    expect(event.gaesteanzahlAktuell).toBe(80);
    expect(event.budgetGesamt).toBe("15000.50");
    expect(event.notizen).toBe("intern");
  });

  it("verhindert ungültige Statuswerte", () => {
    expect(() => parseEventStatus("archiviert")).toThrow(
      "Bitte wähle einen gültigen Event-Status.",
    );
  });

  it("verhindert ungültige Kalenderdaten", () => {
    expect(() =>
      parseEventInput({
        name: "Sommerfest",
        datum: "2026-02-31",
        status: "geplant",
        gaesteanzahlGeplant: "120",
        gaesteanzahlAktuell: "80",
        budgetGesamt: "15000",
        notizen: "",
      }),
    ).toThrow("Bitte wähle ein gültiges Event-Datum aus.");
  });
});
