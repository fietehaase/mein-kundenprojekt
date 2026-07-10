import { parseId } from "./guest-input";

export const COMMUNICATION_CHANNELS = [
  "email",
  "whatsapp",
  "telefon",
  "vor_ort",
] as const;

export type CommunicationChannel = (typeof COMMUNICATION_CHANNELS)[number];

export type CommunicationFormInput = {
  eventId: string;
  kanal: string;
  datum: string;
  inhalt: string;
  istVerbindlich: string | null;
  beteiligte: string;
  erstelltVon: string;
};

export type ParsedCommunicationInput = {
  eventId: number;
  kanal: CommunicationChannel;
  datum: Date;
  inhalt: string;
  istVerbindlich: boolean;
  beteiligte: string | null;
  erstelltVon: string | null;
};

export function parseCommunicationInput(
  input: CommunicationFormInput,
): ParsedCommunicationInput {
  const inhalt = input.inhalt.trim();

  if (!inhalt) {
    throw new Error("Der Kommunikationsinhalt ist erforderlich.");
  }

  return {
    eventId: parseId(input.eventId, "Event-ID"),
    kanal: parseCommunicationChannel(input.kanal),
    datum: parseDateTimeInput(input.datum, "Kommunikationsdatum"),
    inhalt,
    istVerbindlich: input.istVerbindlich === "on",
    beteiligte: optionalText(input.beteiligte),
    erstelltVon: optionalText(input.erstelltVon),
  };
}

export function parseCommunicationChannel(
  channel: string,
): CommunicationChannel {
  if (COMMUNICATION_CHANNELS.includes(channel as CommunicationChannel)) {
    return channel as CommunicationChannel;
  }

  throw new Error("Ungueltiger Kommunikationskanal.");
}

function optionalText(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue || null;
}

function parseDateTimeInput(value: string, label: string): Date {
  if (!value) {
    throw new Error(`${label} ist erforderlich.`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} ist ungueltig.`);
  }

  return date;
}
