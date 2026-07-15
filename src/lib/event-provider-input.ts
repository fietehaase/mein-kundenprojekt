import { optionalDate } from "./form-input";
import { parseId } from "./guest-input";

export const EVENT_PROVIDER_STATUSES = [
  "angefragt",
  "vertrag_offen",
  "bestaetigt",
  "storniert",
  "ausgefallen",
] as const;

export type EventProviderStatus = (typeof EVENT_PROVIDER_STATUSES)[number];

export type EventProviderFormInput = {
  eventId: string;
  dienstleisterId: string;
  status: string;
  vertragsUrl: string;
  stornofrist: string;
  kritisch: string | null;
};

export type ParsedEventProviderInput = {
  eventId: number;
  dienstleisterId: number;
  status: EventProviderStatus;
  vertragsUrl: string | null;
  stornofrist: Date | null;
  kritisch: boolean;
};

export function parseEventProviderInput(
  input: EventProviderFormInput,
): ParsedEventProviderInput {
  return {
    eventId: parseId(input.eventId, "Event-ID"),
    dienstleisterId: parseId(input.dienstleisterId, "Dienstleister-ID"),
    status: parseEventProviderStatus(input.status),
    vertragsUrl: optionalUrl(input.vertragsUrl),
    stornofrist: optionalDate(input.stornofrist, "Stornofrist"),
    kritisch: input.kritisch === "on",
  };
}

export function parseEventProviderStatus(
  status: string,
): EventProviderStatus {
  if (EVENT_PROVIDER_STATUSES.includes(status as EventProviderStatus)) {
    return status as EventProviderStatus;
  }

  throw new Error("Bitte wähle einen gültigen Dienstleister-Status.");
}

function optionalUrl(value: string): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    throw new Error("Bitte gib eine gültige Vertrags-URL ein.");
  }

  throw new Error("Bitte gib eine gültige Vertrags-URL ein.");
}
