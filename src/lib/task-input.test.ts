import { describe, expect, it } from "vitest";
import { parseTaskInput, parseTaskStatus } from "./task-input";

describe("parseTaskInput", () => {
  it("normalisiert valide Aufgaben", () => {
    const task = parseTaskInput({
      eventId: "4",
      bezeichnung: " Catering bestätigen ",
      faelligAm: "2026-07-10T12:00",
      status: "offen",
      abhaengigVonId: "2",
      zugewiesenAn: " Team Planung ",
      erinnerungAm: "2026-07-09T09:00",
    });

    expect(task.eventId).toBe(4);
    expect(task.bezeichnung).toBe("Catering bestätigen");
    expect(task.status).toBe("offen");
    expect(task.abhaengigVonId).toBe(2);
    expect(task.zugewiesenAn).toBe("Team Planung");
    expect(task.faelligAm).toBeInstanceOf(Date);
    expect(task.erinnerungAm).toBeInstanceOf(Date);
  });

  it("erlaubt optionale Felder", () => {
    const task = parseTaskInput({
      eventId: "4",
      bezeichnung: "Briefing",
      faelligAm: "",
      status: "erledigt",
      abhaengigVonId: "",
      zugewiesenAn: "",
      erinnerungAm: "",
    });

    expect(task.faelligAm).toBeNull();
    expect(task.abhaengigVonId).toBeNull();
    expect(task.zugewiesenAn).toBeNull();
    expect(task.erinnerungAm).toBeNull();
  });

  it("validiert Pflichtfeld und Status", () => {
    expect(() =>
      parseTaskInput({
        eventId: "4",
        bezeichnung: " ",
        faelligAm: "",
        status: "offen",
        abhaengigVonId: "",
        zugewiesenAn: "",
        erinnerungAm: "",
      }),
    ).toThrow("Die Aufgaben-Bezeichnung ist erforderlich.");

    expect(() => parseTaskStatus("blockiert")).toThrow(
      "Ungültiger Aufgabenstatus.",
    );
  });
});
