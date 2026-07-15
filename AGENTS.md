# AGENTS.md - Event Management System

## Projekt

Dieses Repository enthält ein Solo-Projekt für ein Event Management System. Das System unterstützt die Planung und Steuerung von Events, inklusive Ablaufplänen, Aufgaben, Dienstleistern, verbindlicher Kommunikation und Budgetinformationen.

## Arbeitsmodus

Solo-Projekt nach der Methodik aus `jacekzawisza/modus-operandi`, angepasst für Codex/Agentenarbeit.

- Kein Team-Setup, keine Mission-Dokumente.
- Keine Meeting- oder Results-Ordner.
- `docs/spec.md` ersetzt die Rolle von `prd.md`.
- Falls irgendwo `prd.md` erwähnt wird, ist für dieses Projekt `docs/spec.md` gemeint.

## Was bauen wir?

Lies zuerst [docs/spec.md](docs/spec.md). Die Datei ist die fachliche Single Source of Truth für Scope, Entitäten, Beziehungen, Geschäftsregeln und offene Punkte.

## Tech-Stack + Standards

Lies [docs/architecture.md](docs/architecture.md).

Wichtige Vorgabe:

- SQLite ist verpflichtend.

## Architektur-Entscheidungen

Lies [docs/decisions.md](docs/decisions.md). Aktualisiere die Datei, wenn eine Architektur- oder Produktentscheidung getroffen wird, die später nachvollziehbar sein muss.

## Arbeitsweise

Lies [docs/modus-operandi.md](docs/modus-operandi.md).

## Coding-Prinzipien

1. Think Before Coding: Annahmen explizit machen, Erfolgskriterien klären und bei fachlicher Mehrdeutigkeit stoppen.
2. Simplicity First: Nur die kleinste Lösung bauen, die die aktuelle Aufgabe erfüllt.
3. Surgical Changes: Nur betroffene Dateien anfassen, keine ungefragten Architektur- oder Style-Refactorings.
4. Goal-Driven Execution: Plan, Umsetzung und Verifikation verbinden; Tests oder andere Checks ausführen, sobald sinnvoll möglich.

## Coding-Konventionen

- Deutsche Fachbegriffe aus `docs/spec.md` respektieren.
- Datenmodell-Änderungen müssen auf die Entitäten und Geschäftsregeln in `docs/spec.md` zurückführbar sein.
- Keine neue Persistenztechnologie einführen; SQLite bleibt gesetzt, bis eine explizite Entscheidung in `docs/decisions.md` dokumentiert wird.
- Prisma 7 für SQLite über `@prisma/adapter-better-sqlite3` initialisieren; Prisma-Zugriff zentral über `src/lib/prisma.ts`.
- `src/generated/prisma` nicht manuell editieren und nicht committen; der Client wird per `prisma generate` erzeugt.
- Sichtbare deutsche Texte und Dokumentation verwenden Umlaute; technische Identifier, Enum-Werte und Datenbankfelder bleiben stabil.
- Commit-Messages im Conventional-Commits-Stil schreiben, z.B. `docs: ...`, `feat: ...`, `fix: ...`.

## Definition of Done

Eine Aufgabe gilt erst als abgeschlossen, wenn:

- `npm run lint` erfolgreich war.
- `npm run build` erfolgreich war.
- Bestehende Funktionen weiterhin funktionieren.
- Keine doppelten Komponenten entstanden sind.
- Keine toten Dateien zurückbleiben.
- Betroffene Dokumentation aktualisiert wurde.

## Bekannte Fallen

- `docs/spec.md` ist keine Rohnotiz, sondern die Projektgrundlage.
- `prd.md` nicht anlegen, nicht referenzieren und nicht aus Templates kopieren.
- Keine `docs/meetings/` oder `docs/results/` Struktur anlegen, solange der Solo-Scope das nicht explizit ändert.
- Keine `next/font/google` Imports verwenden, wenn Builds ohne externen Netzwerkzugriff funktionieren müssen.
