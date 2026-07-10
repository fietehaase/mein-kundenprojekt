import { optionalId, optionalMoney } from "./form-input";
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
