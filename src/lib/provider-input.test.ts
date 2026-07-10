import { describe, expect, it } from "vitest";
import { parseProviderCategory, parseProviderInput } from "./provider-input";

describe("parseProviderInput", () => {
  it("normalisiert valide Dienstleister-Eingaben", () => {
    const provider = parseProviderInput({
      name: " Licht & Ton GmbH ",
      kategorie: "technik",
      ansprechpartner: " Eva Technik ",
      telefonMobil: " +49 30 456 ",
      email: " eva@example.com ",
      zuverlaessigkeitsNotiz: " Backup vorhanden ",
      backupFuerId: "12",
    });

    expect(provider.name).toBe("Licht & Ton GmbH");
    expect(provider.kategorie).toBe("technik");
    expect(provider.ansprechpartner).toBe("Eva Technik");
    expect(provider.telefonMobil).toBe("+49 30 456");
    expect(provider.email).toBe("eva@example.com");
    expect(provider.zuverlaessigkeitsNotiz).toBe("Backup vorhanden");
    expect(provider.backupFuerId).toBe(12);
  });

  it("erlaubt optionale Felder", () => {
    const provider = parseProviderInput({
      name: "Location",
      kategorie: "location",
      ansprechpartner: "",
      telefonMobil: "",
      email: "",
      zuverlaessigkeitsNotiz: "",
      backupFuerId: "",
    });

    expect(provider.ansprechpartner).toBeNull();
    expect(provider.backupFuerId).toBeNull();
  });

  it("validiert Pflichtfelder und Kategorien", () => {
    expect(() =>
      parseProviderInput({
        name: "",
        kategorie: "technik",
        ansprechpartner: "",
        telefonMobil: "",
        email: "",
        zuverlaessigkeitsNotiz: "",
        backupFuerId: "",
      }),
    ).toThrow("Der Dienstleister-Name ist erforderlich.");

    expect(() => parseProviderCategory("transport")).toThrow(
      "Ungueltige Dienstleister-Kategorie.",
    );
  });
});
