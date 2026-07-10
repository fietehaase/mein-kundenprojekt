# modus-operandi.md - Solo-Arbeitsweise

_Stand: 2026-07-10_

Dieses Projekt nutzt eine reduzierte Solo-Variante der Modus-Operandi-Methodik aus `jacekzawisza/modus-operandi`.

## Prinzipien

- Artefakte vor Erinnerung: Relevanter Projektkontext steht im Repo.
- Markdown als Single Source of Truth: Projektwissen bleibt versioniert und AI-lesbar.
- Kleine, verifizierte Schritte: Jede Session endet mit einem nachvollziehbaren Stand.
- Kontext vor Kontrolle: Dokumentation dient Klarheit, nicht Prozess-Buerokratie.
- Spec-driven: `docs/spec.md` steuert Produkt- und Fachentscheidungen.

## Zentrale Artefakte

### `AGENTS.md`

Kurzbriefing fuer Coding-Agenten. Muss knapp bleiben und auf Detaildokumente verweisen.

### `docs/spec.md`

Fachliche Grundlage des Projekts. Ersetzt `prd.md`.

Aktualisieren, wenn sich Scope, Entitaeten, Beziehungen, Geschaeftsregeln oder offene fachliche Punkte aendern.

### `docs/architecture.md`

Technische Wahrheit des Projekts: Stack, Datenmodell, Invarianten, Projektstruktur und technische offene Punkte.

Aktualisieren, wenn technische Entscheidungen oder Architekturannahmen entstehen.

### `docs/decisions.md`

Chronologisches Log fuer Architektur- und Produktentscheidungen.

Aktualisieren, wenn eine Entscheidung spaeter relevant ist, z.B. Stack, Persistenz, Auth, Scope-Abgrenzung oder verworfene Alternativen.

### `docs/concepts/`

Optionaler Ort fuer Feature-Konzepte vor groesseren Implementierungen. Verwenden, wenn ein Feature mehrere Dateien, neue Datenmodelle oder unklare Fachlogik betrifft.

### `docs/audit/`

Optionaler Ort fuer Codebase-Audit-Berichte. Verwenden nach groesseren Meilensteinen oder wenn technische Schulden systematisch bewertet werden sollen.

## Bewusst ausgelassen

- Keine `prd.md`: `docs/spec.md` uebernimmt diese Rolle.
- Keine `docs/meetings/`: Fuer dieses Solo-Projekt nicht notwendig.
- Keine `docs/results/`: Outcome-Disziplin wird erst eingefuehrt, wenn echte Nutzer-Workflows live gehen und Lernnotizen gebraucht werden.
- Keine `docs/INBOX.md`: Erst einfuehren, wenn parallele Doc-Edits oder mehrere Worktrees Konflikte erzeugen.
- Keine `docs/backlog.md`: Erst einfuehren, wenn stabile Feature-IDs gebraucht werden, z.B. ab etwa 15 Features oder mehreren Feature-Quellen.

## Session-Workflow

1. Kontext laden: `AGENTS.md`, `docs/spec.md`, bei Bedarf `docs/architecture.md` und `docs/decisions.md`.
2. Ziel klaeren: Erfolgskriterien und betroffene Dateien benennen.
3. Planen: Bei mehrschrittigen Aufgaben kurz Plan mit Verifikation formulieren.
4. Umsetzen: Kleine, gezielte Aenderungen. Keine ungefragten Refactorings.
5. Verifizieren: Tests, Lint, Typecheck oder fachliche Plausibilitaetspruefung ausfuehren, sobald vorhanden.
6. Dokumentieren: `docs/spec.md`, `docs/architecture.md` oder `docs/decisions.md` aktualisieren, wenn sich Projektwissen aendert.
7. Committen: Kleine Commits mit Conventional Commits.

## Feature-Workflow

Fuer kleine Features reicht die direkte Arbeit aus `docs/spec.md`.

Fuer groessere Features:

1. Konzept in `docs/concepts/YYYY-MM-DD-feature-name.md` schreiben.
2. Offene fachliche Fragen aus `docs/spec.md` klaeren oder explizit als Annahme markieren.
3. Implementieren.
4. Architektur- oder Produktentscheidungen in `docs/decisions.md` nachtragen.

## Commit-Regeln

- Vor jedem Commit `git status -sb` pruefen.
- Nur zusammengehoerige Aenderungen committen.
- Commit-Messages im Conventional-Commits-Stil schreiben.
- Falls ein Commit eine Entscheidung umsetzt, die Entscheidung in `docs/decisions.md` referenzieren oder dort vorher dokumentieren.
