import { optionalDateTime, optionalText, requiredDateTime } from "./form-input";
import { parseId } from "./guest-input";

export type SchedulePlanFormInput = {
  eventId: string;
};

export type ParsedSchedulePlanInput = {
  eventId: number;
};

export type ScheduleItemFormInput = {
  ablaufplanId: string;
  uhrzeitStart: string;
  uhrzeitEnde: string;
  bezeichnung: string;
  verantwortlich: string;
  istPuffer: string | null;
  sichtbarFuerDienstleister: string | null;
};

export type ParsedScheduleItemInput = {
  ablaufplanId: number;
  uhrzeitStart: Date;
  uhrzeitEnde: Date | null;
  bezeichnung: string;
  verantwortlich: string | null;
  istPuffer: boolean;
  sichtbarFuerDienstleister: boolean;
};

export function parseSchedulePlanInput(
  input: SchedulePlanFormInput,
): ParsedSchedulePlanInput {
  return {
    eventId: parseId(input.eventId, "Event-ID"),
  };
}

export function parseScheduleItemInput(
  input: ScheduleItemFormInput,
): ParsedScheduleItemInput {
  const ablaufplanId = parseId(input.ablaufplanId, "Ablaufplan-ID");
  const uhrzeitStart = requiredDateTime(input.uhrzeitStart, "Startzeit");
  const uhrzeitEnde = optionalDateTime(input.uhrzeitEnde, "Endzeit");
  const bezeichnung = input.bezeichnung.trim();

  if (!bezeichnung) {
    throw new Error("Bitte gib eine Bezeichnung für den Ablaufpunkt ein.");
  }

  if (uhrzeitEnde && uhrzeitEnde < uhrzeitStart) {
    throw new Error("Die Endzeit darf nicht vor der Startzeit liegen.");
  }

  return {
    ablaufplanId,
    uhrzeitStart,
    uhrzeitEnde,
    bezeichnung,
    verantwortlich: optionalText(input.verantwortlich),
    istPuffer: input.istPuffer === "on",
    sichtbarFuerDienstleister: input.sichtbarFuerDienstleister === "on",
  };
}
