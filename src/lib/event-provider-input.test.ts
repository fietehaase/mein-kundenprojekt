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
      kritisch: "on",
    });

    expect(assignment.eventId).toBe(4);
    expect(assignment.dienstleisterId).toBe(9);
    expect(assignment.status).toBe("bestaetigt");
    expect(assignment.vertragsUrl).toBe("https://example.com/vertrag");
    expect(assignment.stornofrist).toBeInstanceOf(Date);
    expect(assignment.kritisch).toBe(true);
  });

  it("erlaubt optionale Vertragsdaten", () => {
    const assignment = parseEventProviderInput({
      eventId: "4",
      dienstleisterId: "9",
      status: "angefragt",
      vertragsUrl: "",
      stornofrist: "",
      kritisch: null,
    });

    expect(assignment.vertragsUrl).toBeNull();
    expect(assignment.stornofrist).toBeNull();
    expect(assignment.kritisch).toBe(false);
  });

  it("validiert Status und Vertrags-URL", () => {
    expect(() => parseEventProviderStatus("unbekannt")).toThrow(
      "Bitte wähle einen gültigen Dienstleister-Status.",
    );

    expect(() =>
      parseEventProviderInput({
        eventId: "4",
        dienstleisterId: "9",
        status: "bestaetigt",
        vertragsUrl: "ftp://example.com/vertrag",
        stornofrist: "",
        kritisch: null,
      }),
    ).toThrow("Bitte gib eine gültige Vertrags-URL ein.");
  });
});
