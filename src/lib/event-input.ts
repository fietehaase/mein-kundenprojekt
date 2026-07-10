import { optionalText, requiredMoney } from "./form-input";

export const EVENT_STATUSES = [
  "geplant",
  "laufend",
  "abgeschlossen",
  "storniert",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export type EventFormInput = {
  name: string;
  datum: string;
  status: string;
  gaesteanzahlGeplant: string;
  gaesteanzahlAktuell: string;
  budgetGesamt: string;
  notizen: string;
};

export type ParsedEventInput = {
  name: string;
  datum: Date;
  status: EventStatus;
  gaesteanzahlGeplant: number;
  gaesteanzahlAktuell: number;
  budgetGesamt: string;
  notizen: string | null;
};

export function parseEventInput(input: EventFormInput): ParsedEventInput {
  const name = input.name.trim();
  const datum = parseDateInput(input.datum);
  const status = parseEventStatus(input.status);
  const gaesteanzahlGeplant = parseNonNegativeInteger(
    input.gaesteanzahlGeplant,
    "Geplante Gaestezahl",
  );
  const gaesteanzahlAktuell = parseNonNegativeInteger(
    input.gaesteanzahlAktuell,
    "Aktuelle Gaestezahl",
  );
  const budgetGesamt = requiredMoney(input.budgetGesamt, "Das Gesamtbudget");

  if (!name) {
    throw new Error("Der Event-Name ist erforderlich.");
  }

  if (gaesteanzahlAktuell > gaesteanzahlGeplant) {
    throw new Error(
      "Die aktuelle Gaestezahl darf nicht groesser als die geplante Gaestezahl sein.",
    );
  }

  return {
    name,
    datum,
    status,
    gaesteanzahlGeplant,
    gaesteanzahlAktuell,
    budgetGesamt,
    notizen: optionalText(input.notizen),
  };
}

export function parseEventStatus(status: string): EventStatus {
  if (EVENT_STATUSES.includes(status as EventStatus)) {
    return status as EventStatus;
  }

  throw new Error("Ungueltiger Event-Status.");
}

function parseDateInput(value: string): Date {
  if (!value) {
    throw new Error("Das Event-Datum ist erforderlich.");
  }

  const date = new Date(`${value}T00:00:00.000`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Das Event-Datum ist ungueltig.");
  }

  return date;
}

function parseNonNegativeInteger(value: string, label: string): number {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw new Error(`${label} muss eine ganze Zahl ab 0 sein.`);
  }

  return numberValue;
}
