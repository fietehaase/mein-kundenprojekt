# modus-operandi.md - Solo-Arbeitsweise

_Stand: 2026-07-10_

Dieses Projekt nutzt eine reduzierte Solo-Variante der Modus-Operandi-Methodik aus `jacekzawisza/modus-operandi`.

## Prinzipien

- Artefakte vor Erinnerung: Relevanter Projektkontext steht im Repo.
- Markdown als Single Source of Truth: Projektwissen bleibt versioniert und AI-lesbar.
- Kleine, verifizierte Schritte: Jede Session endet mit einem nachvollziehbaren Stand.
- Kontext vor Kontrolle: Dokumentation dient Klarheit, nicht Prozess-Bürokratie.
- Spec-driven: `docs/spec.md` steuert Produkt- und Fachentscheidungen.

## Zentrale Artefakte

### `AGENTS.md`

Kurzbriefing für Coding-Agenten. Muss knapp bleiben und auf Detaildokumente verweisen.

### `docs/spec.md`

Fachliche Grundlage des Projekts. Ersetzt `prd.md`.

Aktualisieren, wenn sich Scope, Entitäten, Beziehungen, Geschäftsregeln oder offene fachliche Punkte ändern.

### `docs/architecture.md`

Technische Wahrheit des Projekts: Stack, Datenmodell, Invarianten, Projektstruktur und technische offene Punkte.

Aktualisieren, wenn technische Entscheidungen oder Architekturannahmen entstehen.

### `docs/decisions.md`

Chronologisches Log für Architektur- und Produktentscheidungen.

Aktualisieren, wenn eine Entscheidung später relevant ist, z.B. Stack, Persistenz, Auth, Scope-Abgrenzung oder verworfene Alternativen.

### `docs/concepts/`

Optionaler Ort für Feature-Konzepte vor größeren Implementierungen. Verwenden, wenn ein Feature mehrere Dateien, neue Datenmodelle oder unklare Fachlogik betrifft.

### `docs/audit/`

Optionaler Ort für Codebase-Audit-Berichte. Verwenden nach größeren Meilensteinen oder wenn technische Schulden systematisch bewertet werden sollen.

## Bewusst ausgelassen

- Keine `prd.md`: `docs/spec.md` übernimmt diese Rolle.
- Keine `docs/meetings/`: Für dieses Solo-Projekt nicht notwendig.
- Keine `docs/results/`: Outcome-Disziplin wird erst eingeführt, wenn echte Nutzer-Workflows live gehen und Lernnotizen gebraucht werden.
- Keine `docs/INBOX.md`: Erst einführen, wenn parallele Doc-Edits oder mehrere Worktrees Konflikte erzeugen.
- Keine `docs/backlog.md`: Erst einführen, wenn stabile Feature-IDs gebraucht werden, z.B. ab etwa 15 Features oder mehreren Feature-Quellen.

## Session-Workflow

1. Kontext laden: `AGENTS.md`, `docs/spec.md`, bei Bedarf `docs/architecture.md` und `docs/decisions.md`.
2. Ziel klären: Erfolgskriterien und betroffene Dateien benennen.
3. Planen: Bei mehrschrittigen Aufgaben kurz Plan mit Verifikation formulieren.
4. Umsetzen: Kleine, gezielte Änderungen. Keine ungefragten Refactorings.
5. Verifizieren: Tests, Lint, Typecheck oder fachliche Plausibilitätsprüfung ausfuehren, sobald vorhanden.
6. Dokumentieren: `docs/spec.md`, `docs/architecture.md` oder `docs/decisions.md` aktualisieren, wenn sich Projektwissen ändert.
7. Committen: Kleine Commits mit Conventional Commits.

## Feature-Workflow

Für kleine Features reicht die direkte Arbeit aus `docs/spec.md`.

Für größere Features:

1. Konzept in `docs/concepts/YYYY-MM-DD-feature-name.md` schreiben.
2. Offene fachliche Fragen aus `docs/spec.md` klären oder explizit als Annahme markieren.
3. Implementieren.
4. Architektur- oder Produktentscheidungen in `docs/decisions.md` nachtragen.

## Commit-Regeln

- Vor jedem Commit `git status -sb` prüfen.
- Nur zusammengehörige Änderungen committen.
- Commit-Messages im Conventional-Commits-Stil schreiben.
- Falls ein Commit eine Entscheidung umsetzt, die Entscheidung in `docs/decisions.md` referenzieren oder dort vorher dokumentieren.
