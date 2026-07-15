import { describe, expect, it } from "vitest";
import {
  parseGuestInput,
  parseGuestStatus,
  parseGuestType,
  parseId,
} from "./guest-input";

describe("parseGuestInput", () => {
  it("normalisiert valide Gästeingaben", () => {
    const guest = parseGuestInput({
      eventId: "1",
      name: " Erika Muster ",
      email: " erika@example.com ",
      telefon: " +49 30 123 ",
      typ: "vip",
      anmeldestatus: "bestaetigt",
      ernaehrung: "vegetarisch",
      allergien: "",
      tischzuweisung: " Tisch 4 ",
      vipAnforderungen: "Transfer",
    });

    expect(guest.eventId).toBe(1);
    expect(guest.name).toBe("Erika Muster");
    expect(guest.typ).toBe("vip");
    expect(guest.anmeldestatus).toBe("bestaetigt");
    expect(guest.email).toBe("erika@example.com");
    expect(guest.allergien).toBeNull();
    expect(guest.tischzuweisung).toBe("Tisch 4");
  });

  it("verhindert leere Namen", () => {
    expect(() =>
      parseGuestInput({
        eventId: "1",
        name: " ",
        email: "",
        telefon: "",
        typ: "standard",
        anmeldestatus: "angemeldet",
        ernaehrung: "",
        allergien: "",
        tischzuweisung: "",
        vipAnforderungen: "",
      }),
    ).toThrow("Der Gastname ist erforderlich.");
  });

  it("validiert IDs, Typen und Statuswerte", () => {
    expect(() => parseId("0", "Gast-ID")).toThrow("Gast-ID ist ungültig.");
    expect(() => parseGuestType("kunde")).toThrow("Ungültiger Gasttyp.");
    expect(() => parseGuestStatus("offen")).toThrow(
      "Ungültiger Anmeldestatus.",
    );
  });
});
