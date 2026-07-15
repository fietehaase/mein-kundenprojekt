import { optionalText } from "./form-input";

export const GUEST_TYPES = [
  "standard",
  "vip",
  "speaker",
  "dienstleister_gast",
] as const;

export const GUEST_STATUSES = [
  "angemeldet",
  "abgesagt",
  "warteliste",
  "bestaetigt",
] as const;

export type GuestType = (typeof GUEST_TYPES)[number];
export type GuestStatus = (typeof GUEST_STATUSES)[number];

export type GuestFormInput = {
  eventId: string;
  name: string;
  email: string;
  telefon: string;
  typ: string;
  anmeldestatus: string;
  ernaehrung: string;
  allergien: string;
  tischzuweisung: string;
  vipAnforderungen: string;
};

export type ParsedGuestInput = {
  eventId: number;
  name: string;
  email: string | null;
  telefon: string | null;
  typ: GuestType;
  anmeldestatus: GuestStatus;
  ernaehrung: string | null;
  allergien: string | null;
  tischzuweisung: string | null;
  vipAnforderungen: string | null;
};

export function parseGuestInput(input: GuestFormInput): ParsedGuestInput {
  const eventId = parseId(input.eventId, "Event-ID");
  const name = input.name.trim();

  if (!name) {
    throw new Error("Der Gastname ist erforderlich.");
  }

  return {
    eventId,
    name,
    email: optionalText(input.email),
    telefon: optionalText(input.telefon),
    typ: parseGuestType(input.typ),
    anmeldestatus: parseGuestStatus(input.anmeldestatus),
    ernaehrung: optionalText(input.ernaehrung),
    allergien: optionalText(input.allergien),
    tischzuweisung: optionalText(input.tischzuweisung),
    vipAnforderungen: optionalText(input.vipAnforderungen),
  };
}

export function parseGuestStatus(status: string): GuestStatus {
  if (GUEST_STATUSES.includes(status as GuestStatus)) {
    return status as GuestStatus;
  }

  throw new Error("Ungültiger Anmeldestatus.");
}

export function parseGuestType(type: string): GuestType {
  if (GUEST_TYPES.includes(type as GuestType)) {
    return type as GuestType;
  }

  throw new Error("Ungültiger Gasttyp.");
}

export function parseId(value: string, label: string): number {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`${label} ist ungültig.`);
  }

  return id;
}
