import { describe, expect, it } from "vitest";
import {
  parseCommunicationChannel,
  parseCommunicationInput,
} from "./communication-input";

describe("parseCommunicationInput", () => {
  it("normalisiert valide Kommunikation", () => {
    const communication = parseCommunicationInput({
      eventId: "5",
      kanal: "email",
      datum: "2026-07-10T14:30",
      inhalt: " Catering bestätigt ",
      istVerbindlich: "on",
      beteiligte: " Kunde, Catering ",
      erstelltVon: " Event-Team ",
    });

    expect(communication.eventId).toBe(5);
    expect(communication.kanal).toBe("email");
    expect(communication.inhalt).toBe("Catering bestätigt");
    expect(communication.istVerbindlich).toBe(true);
    expect(communication.beteiligte).toBe("Kunde, Catering");
    expect(communication.erstelltVon).toBe("Event-Team");
    expect(communication.datum).toBeInstanceOf(Date);
  });

  it("erlaubt optionale Felder und unverbindliche Notizen", () => {
    const communication = parseCommunicationInput({
      eventId: "5",
      kanal: "telefon",
      datum: "2026-07-10T14:30",
      inhalt: "Rückfrage zur Technik",
      istVerbindlich: null,
      beteiligte: "",
      erstelltVon: " ",
    });

    expect(communication.istVerbindlich).toBe(false);
    expect(communication.beteiligte).toBeNull();
    expect(communication.erstelltVon).toBeNull();
  });

  it("validiert Pflichtfeld und Kanal", () => {
    expect(() =>
      parseCommunicationInput({
        eventId: "5",
        kanal: "email",
        datum: "2026-07-10T14:30",
        inhalt: " ",
        istVerbindlich: null,
        beteiligte: "",
        erstelltVon: "",
      }),
    ).toThrow("Der Kommunikationsinhalt ist erforderlich.");

    expect(() => parseCommunicationChannel("sms")).toThrow(
      "Ungültiger Kommunikationskanal.",
    );
  });
});
