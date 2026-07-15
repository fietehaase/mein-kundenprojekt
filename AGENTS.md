# AGENTS.md - Event Management System

## Projekt

Dieses Repository enthaelt ein Solo-Projekt fuer ein Event Management System. Das System unterstuetzt die Planung und Steuerung von Events, inklusive Ablaufplaenen, Aufgaben, Dienstleistern, verbindlicher Kommunikation und Budgetinformationen.

## Arbeitsmodus

Solo-Projekt nach der Methodik aus `jacekzawisza/modus-operandi`, angepasst fuer Codex/Agentenarbeit.

- Kein Team-Setup, keine Mission-Dokumente.
- Keine Meeting- oder Results-Ordner.
- `docs/spec.md` ersetzt die Rolle von `prd.md`.
- Falls irgendwo `prd.md` erwaehnt wird, ist fuer dieses Projekt `docs/spec.md` gemeint.

## Was bauen wir?

Lies zuerst [docs/spec.md](docs/spec.md). Die Datei ist die fachliche Single Source of Truth fuer Scope, Entitaeten, Beziehungen, Geschaeftsregeln und offene Punkte.

## Tech-Stack + Standards

Lies [docs/architecture.md](docs/architecture.md).

Wichtige Vorgabe:

- SQLite ist verpflichtend.

## Architektur-Entscheidungen

Lies [docs/decisions.md](docs/decisions.md). Aktualisiere die Datei, wenn eine Architektur- oder Produktentscheidung getroffen wird, die spaeter nachvollziehbar sein muss.

## Arbeitsweise

Lies [docs/modus-operandi.md](docs/modus-operandi.md).

## Coding-Prinzipien

1. Think Before Coding: Annahmen explizit machen, Erfolgskriterien klaeren und bei fachlicher Mehrdeutigkeit stoppen.
2. Simplicity First: Nur die kleinste Loesung bauen, die die aktuelle Aufgabe erfuellt.
3. Surgical Changes: Nur betroffene Dateien anfassen, keine ungefragten Architektur- oder Style-Refactorings.
4. Goal-Driven Execution: Plan, Umsetzung und Verifikation verbinden; Tests oder andere Checks ausfuehren, sobald sinnvoll moeglich.

## Coding-Konventionen

- Deutsche Fachbegriffe aus `docs/spec.md` respektieren.
- Datenmodell-Aenderungen muessen auf die Entitaeten und Geschaeftsregeln in `docs/spec.md` zurueckfuehrbar sein.
- Keine neue Persistenztechnologie einfuehren; SQLite bleibt gesetzt, bis eine explizite Entscheidung in `docs/decisions.md` dokumentiert wird.
- Prisma 7 fuer SQLite ueber `@prisma/adapter-better-sqlite3` initialisieren; Prisma-Zugriff zentral ueber `src/lib/prisma.ts`.
- `src/generated/prisma` nicht manuell editieren und nicht committen; der Client wird per `prisma generate` erzeugt.
- Commit-Messages im Conventional-Commits-Stil schreiben, z.B. `docs: ...`, `feat: ...`, `fix: ...`.

## Definition of Done

Eine Aufgabe gilt erst als abgeschlossen, wenn:

- `npm run lint` erfolgreich war.
- `npm run build` erfolgreich war.
- Bestehende Funktionen weiterhin funktionieren.
- Keine doppelten Komponenten entstanden sind.
- Keine toten Dateien zurueckbleiben.
- Betroffene Dokumentation aktualisiert wurde.

## Bekannte Fallen

- `docs/spec.md` ist keine Rohnotiz, sondern die Projektgrundlage.
- `prd.md` nicht anlegen, nicht referenzieren und nicht aus Templates kopieren.
- Keine `docs/meetings/` oder `docs/results/` Struktur anlegen, solange der Solo-Scope das nicht explizit aendert.
- Keine `next/font/google` Imports verwenden, wenn Builds ohne externen Netzwerkzugriff funktionieren muessen.
