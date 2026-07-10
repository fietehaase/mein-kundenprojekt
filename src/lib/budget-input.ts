import { parseId } from "./guest-input";

export type BudgetFormInput = {
  eventId: string;
  bezeichnung: string;
  betragAngebot: string;
  betragBestaetigt: string;
  betragBezahlt: string;
  dienstleisterId: string;
};

export type ParsedBudgetInput = {
  eventId: number;
  bezeichnung: string;
  betragAngebot: string | null;
  betragBestaetigt: string | null;
  betragBezahlt: string | null;
  dienstleisterId: number | null;
};

export function parseBudgetInput(input: BudgetFormInput): ParsedBudgetInput {
  const bezeichnung = input.bezeichnung.trim();

  if (!bezeichnung) {
    throw new Error("Die Budget-Bezeichnung ist erforderlich.");
  }

  return {
    eventId: parseId(input.eventId, "Event-ID"),
    bezeichnung,
    betragAngebot: optionalMoney(input.betragAngebot, "Angebotsbetrag"),
    betragBestaetigt: optionalMoney(
      input.betragBestaetigt,
      "Bestaetigter Betrag",
    ),
    betragBezahlt: optionalMoney(input.betragBezahlt, "Bezahlter Betrag"),
    dienstleisterId: optionalId(input.dienstleisterId, "Dienstleister"),
  };
}

function optionalMoney(value: string, label: string): string | null {
  const normalizedValue = value.replace(",", ".").trim();

  if (!normalizedValue) {
    return null;
  }

  const numberValue = Number(normalizedValue);

  if (Number.isNaN(numberValue) || numberValue < 0) {
    throw new Error(`${label} muss eine Zahl ab 0 sein.`);
  }

  return numberValue.toFixed(2);
}

function optionalId(value: string, label: string): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const id = Number(trimmedValue);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`${label} ist ungueltig.`);
  }

  return id;
}
