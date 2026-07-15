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
    "Geplante Gästezahl",
  );
  const gaesteanzahlAktuell = parseNonNegativeInteger(
    input.gaesteanzahlAktuell,
    "Aktuelle Gästezahl",
  );
  const budgetGesamt = requiredMoney(input.budgetGesamt, "Das Gesamtbudget");

  if (!name) {
    throw new Error("Der Event-Name ist erforderlich.");
  }

  if (gaesteanzahlAktuell > gaesteanzahlGeplant) {
    throw new Error(
      "Die aktuelle Gästezahl darf nicht größer als die geplante Gästezahl sein.",
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

  throw new Error("Ungültiger Event-Status.");
}

function parseDateInput(value: string): Date {
  if (!value) {
    throw new Error("Das Event-Datum ist erforderlich.");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(`${value}T00:00:00.000`);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    throw new Error("Das Event-Datum ist ungültig.");
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
