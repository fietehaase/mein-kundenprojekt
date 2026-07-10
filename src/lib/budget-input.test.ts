import { describe, expect, it } from "vitest";
import { parseBudgetInput } from "./budget-input";

describe("parseBudgetInput", () => {
  it("normalisiert valide Budgetpositionen", () => {
    const budget = parseBudgetInput({
      eventId: "3",
      bezeichnung: " Catering ",
      betragAngebot: "1200,50",
      betragBestaetigt: "1100",
      betragBezahlt: "500.25",
      dienstleisterId: "7",
    });

    expect(budget.eventId).toBe(3);
    expect(budget.bezeichnung).toBe("Catering");
    expect(budget.betragAngebot).toBe("1200.50");
    expect(budget.betragBestaetigt).toBe("1100.00");
    expect(budget.betragBezahlt).toBe("500.25");
    expect(budget.dienstleisterId).toBe(7);
  });

  it("erlaubt optionale Betraege und Dienstleister", () => {
    const budget = parseBudgetInput({
      eventId: "3",
      bezeichnung: "Location",
      betragAngebot: "",
      betragBestaetigt: " ",
      betragBezahlt: "",
      dienstleisterId: "",
    });

    expect(budget.betragAngebot).toBeNull();
    expect(budget.betragBestaetigt).toBeNull();
    expect(budget.betragBezahlt).toBeNull();
    expect(budget.dienstleisterId).toBeNull();
  });

  it("validiert Pflichtfelder und Betraege", () => {
    expect(() =>
      parseBudgetInput({
        eventId: "3",
        bezeichnung: " ",
        betragAngebot: "",
        betragBestaetigt: "",
        betragBezahlt: "",
        dienstleisterId: "",
      }),
    ).toThrow("Die Budget-Bezeichnung ist erforderlich.");

    expect(() =>
      parseBudgetInput({
        eventId: "3",
        bezeichnung: "Technik",
        betragAngebot: "-1",
        betragBestaetigt: "",
        betragBezahlt: "",
        dienstleisterId: "",
      }),
    ).toThrow("Angebotsbetrag muss eine Zahl ab 0 sein.");
  });
});
