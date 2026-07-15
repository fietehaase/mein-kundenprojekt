import { describe, expect, it } from "vitest";
import { canCompleteTask, isTaskBlockedByDependency } from "./task-dependency";

describe("Aufgabenabhaengigkeiten", () => {
  it("blockiert Aufgaben mit unerledigter Vorgaenger-Aufgabe", () => {
    const task = { abhaengigVon: { status: "offen" } };

    expect(isTaskBlockedByDependency(task)).toBe(true);
    expect(canCompleteTask(task)).toBe(false);
  });

  it("erlaubt Aufgaben ohne oder mit erledigter Vorgaenger-Aufgabe", () => {
    expect(canCompleteTask({ abhaengigVon: null })).toBe(true);
    expect(canCompleteTask({ abhaengigVon: { status: "erledigt" } })).toBe(
      true,
    );
  });
});
