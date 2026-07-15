import { optionalDateTime, optionalId, optionalText } from "./form-input";
import { parseId } from "./guest-input";

export const TASK_STATUSES = ["offen", "erledigt", "ueberfaellig"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskFormInput = {
  eventId: string;
  bezeichnung: string;
  faelligAm: string;
  status: string;
  abhaengigVonId: string;
  zugewiesenAn: string;
  erinnerungAm: string;
};

export type ParsedTaskInput = {
  eventId: number;
  bezeichnung: string;
  faelligAm: Date | null;
  status: TaskStatus;
  abhaengigVonId: number | null;
  zugewiesenAn: string | null;
  erinnerungAm: Date | null;
};

export function parseTaskInput(input: TaskFormInput): ParsedTaskInput {
  const bezeichnung = input.bezeichnung.trim();

  if (!bezeichnung) {
    throw new Error("Bitte gib eine Aufgaben-Bezeichnung ein.");
  }

  return {
    eventId: parseId(input.eventId, "Event-ID"),
    bezeichnung,
    faelligAm: optionalDateTime(input.faelligAm, "Fälligkeit"),
    status: parseTaskStatus(input.status),
    abhaengigVonId: optionalId(input.abhaengigVonId, "Vorgänger-Aufgabe"),
    zugewiesenAn: optionalText(input.zugewiesenAn),
    erinnerungAm: optionalDateTime(input.erinnerungAm, "Erinnerung"),
  };
}

export function parseTaskStatus(status: string): TaskStatus {
  if (TASK_STATUSES.includes(status as TaskStatus)) {
    return status as TaskStatus;
  }

  throw new Error("Bitte wähle einen gültigen Aufgabenstatus.");
}
