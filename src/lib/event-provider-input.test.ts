import { describe, expect, it } from "vitest";
import {
  parseEventProviderInput,
  parseEventProviderStatus,
} from "./event-provider-input";

describe("parseEventProviderInput", () => {
  it("normalisiert valide Event-Dienstleister-Zuordnungen", () => {
    const assignment = parseEventProviderInput({
      eventId: "4",
      dienstleisterId: "9",
      status: "bestaetigt",
      vertragsUrl: "https://example.com/vertrag",
      stornofrist: "2026-07-20",
    });

    expect(assignment.eventId).toBe(4);
    expect(assignment.dienstleisterId).toBe(9);
    expect(assignment.status).toBe("bestaetigt");
    expect(assignment.vertragsUrl).toBe("https://example.com/vertrag");
    expect(assignment.stornofrist).toBeInstanceOf(Date);
  });

  it("erlaubt optionale Vertragsdaten", () => {
    const assignment = parseEventProviderInput({
      eventId: "4",
      dienstleisterId: "9",
      status: "angefragt",
      vertragsUrl: "",
      stornofrist: "",
    });

    expect(assignment.vertragsUrl).toBeNull();
    expect(assignment.stornofrist).toBeNull();
  });

  it("validiert Status und Vertrags-URL", () => {
    expect(() => parseEventProviderStatus("unbekannt")).toThrow(
      "Ungueltiger Event-Dienstleister-Status.",
    );

    expect(() =>
      parseEventProviderInput({
        eventId: "4",
        dienstleisterId: "9",
        status: "bestaetigt",
        vertragsUrl: "ftp://example.com/vertrag",
        stornofrist: "",
      }),
    ).toThrow("Die Vertrags-URL ist ungueltig.");
  });
});
