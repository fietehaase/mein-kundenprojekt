import { optionalDate } from "./form-input";
import { parseId } from "./guest-input";

export const EVENT_PROVIDER_STATUSES = [
  "angefragt",
  "vertrag_offen",
  "bestaetigt",
  "storniert",
] as const;

export type EventProviderStatus = (typeof EVENT_PROVIDER_STATUSES)[number];

export type EventProviderFormInput = {
  eventId: string;
  dienstleisterId: string;
  status: string;
  vertragsUrl: string;
  stornofrist: string;
};

export type ParsedEventProviderInput = {
  eventId: number;
  dienstleisterId: number;
  status: EventProviderStatus;
  vertragsUrl: string | null;
  stornofrist: Date | null;
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
  };
}

export function parseEventProviderStatus(
  status: string,
): EventProviderStatus {
  if (EVENT_PROVIDER_STATUSES.includes(status as EventProviderStatus)) {
    return status as EventProviderStatus;
  }

  throw new Error("Ungueltiger Event-Dienstleister-Status.");
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
    throw new Error("Die Vertrags-URL ist ungueltig.");
  }

  throw new Error("Die Vertrags-URL ist ungueltig.");
}
