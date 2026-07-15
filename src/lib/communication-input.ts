import { optionalText, requiredDateTime } from "./form-input";
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
    datum: requiredDateTime(input.datum, "Kommunikationsdatum"),
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

  throw new Error("Ungültiger Kommunikationskanal.");
}
