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
    throw new Error("Die Aufgaben-Bezeichnung ist erforderlich.");
  }

  return {
    eventId: parseId(input.eventId, "Event-ID"),
    bezeichnung,
    faelligAm: optionalDateTime(input.faelligAm, "Faelligkeit"),
    status: parseTaskStatus(input.status),
    abhaengigVonId: optionalId(input.abhaengigVonId, "Vorgaenger-Aufgabe"),
    zugewiesenAn: optionalText(input.zugewiesenAn),
    erinnerungAm: optionalDateTime(input.erinnerungAm, "Erinnerung"),
  };
}

export function parseTaskStatus(status: string): TaskStatus {
  if (TASK_STATUSES.includes(status as TaskStatus)) {
    return status as TaskStatus;
  }

  throw new Error("Ungueltiger Aufgabenstatus.");
}

function optionalText(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue || null;
}

function optionalId(value: string, label: string): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const id = Number(trimmedValue);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`${label} ist ungueltig.`);
  }

  return id;
}

function optionalDateTime(value: string, label: string): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} ist ungueltig.`);
  }

  return date;
}
