import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("lokale SQLite-Persistenz", () => {
  it("verwendet SQLite und bildet das fachliche Kernmodell ab", () => {
    const schema = readFileSync(
      join(process.cwd(), "prisma/schema.prisma"),
      "utf8",
    );
    const migrationLock = readFileSync(
      join(process.cwd(), "prisma/migrations/migration_lock.toml"),
      "utf8",
    );

    expect(schema).toContain('provider = "sqlite"');
    expect(migrationLock).toContain('provider = "sqlite"');

    [
      "model Event",
      "model Gast",
      "model Dienstleister",
      "model Ablaufplan",
      "model Ablaufpunkt",
      "model Aufgabe",
      "model Kommunikation",
      "model BudgetPosition",
      "model EventDienstleister",
    ].forEach((modelName) => {
      expect(schema).toContain(modelName);
    });
  });
});
