import { describe, expect, it } from "vitest";
import { canCompleteTask, isTaskBlockedByDependency } from "./task-dependency";

describe("Aufgabenabhängigkeiten", () => {
  it("blockiert Aufgaben mit unerledigter Vorgänger-Aufgabe", () => {
    const task = { abhaengigVon: { status: "offen" } };

    expect(isTaskBlockedByDependency(task)).toBe(true);
    expect(canCompleteTask(task)).toBe(false);
  });

  it("erlaubt Aufgaben ohne oder mit erledigter Vorgänger-Aufgabe", () => {
    expect(canCompleteTask({ abhaengigVon: null })).toBe(true);
    expect(canCompleteTask({ abhaengigVon: { status: "erledigt" } })).toBe(
      true,
    );
  });
});
