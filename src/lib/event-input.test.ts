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

  it("verhindert ungueltige Statuswerte", () => {
    expect(() => parseEventStatus("archiviert")).toThrow(
      "Ungueltiger Event-Status.",
    );
  });
});
