import { describe, expect, it } from "vitest";
import { buildEventInsights, type EventInsightInput } from "./event-insights";

const baseEvent: EventInsightInput = {
  name: "Sommerfest",
  datum: new Date("2026-08-01T00:00:00.000Z"),
  gaesteanzahlGeplant: 100,
  budgetGesamt: 10000,
  budgetPruefbeduerftig: false,
  gaeste: [],
  aufgaben: [],
  budgetPositionen: [],
  aktuelleAblaufpunkte: [],
  verbindlicheKommunikation: 1,
};

describe("buildEventInsights", () => {
  it("priorisiert Dienstleister-Eskalationen hoch", () => {
    const insights = buildEventInsights([
      {
        ...baseEvent,
        aktuelleAblaufpunkte: [{ eskaliert: true }],
      },
    ]);

    expect(insights[0]).toMatchObject({
      eventName: "Sommerfest",
      priority: "hoch",
      title: "Dienstleister-Ausfall prüfen",
    });
  });

  it("erkennt Budgetüberschreitungen", () => {
    const insights = buildEventInsights([
      {
        ...baseEvent,
        budgetPositionen: [
          { betragBestaetigt: 6000, pruefbeduerftig: false },
          { betragBestaetigt: 5000, pruefbeduerftig: false },
        ],
      },
    ]);

    expect(insights).toContainEqual(
      expect.objectContaining({
        priority: "hoch",
        title: "Budget überschritten",
      }),
    );
  });

  it("sortiert dringende Hinweise vor mittlere Hinweise", () => {
    const insights = buildEventInsights([
      {
        ...baseEvent,
        name: "Prüfung",
        budgetPruefbeduerftig: true,
      },
      {
        ...baseEvent,
        name: "Ausfall",
        aufgaben: [
          {
            status: "offen",
            pruefbeduerftig: false,
            eskaliert: true,
          },
        ],
      },
    ]);

    expect(insights[0]?.eventName).toBe("Ausfall");
    expect(insights[0]?.priority).toBe("hoch");
  });
});
