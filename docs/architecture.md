# architecture.md - Event Management System

_Stand: 2026-07-10_

## Zweck

Dieses Dokument hält den technischen Rahmen für das Event Management System fest. Die fachliche Quelle ist `docs/spec.md`.

## Projektstatus

- Phase: App-Grundgerüst initialisiert.
- Fachliche Grundlage: `docs/spec.md`.
- Offene fachliche Punkte stehen in `docs/spec.md` und müssen vor betroffenen Implementierungen geklärt werden.

## Architekturentscheidung: Framework, ORM und Datenbank

Das Projekt verwendet:

- Framework: Next.js 16 mit App Router, TypeScript, ESLint und `src/`-Struktur.
- ORM: Prisma 7 mit generiertem Client unter `src/generated/prisma`.
- Datenbank: SQLite, lokal unter `prisma/dev.db`.

Begründung:

- Next.js deckt UI, Routing und serverseitige Funktionen in einem Projekt ab. Das passt zu einem Solo-Projekt, weil weniger Infrastruktur und weniger Integrationsaufwand nötig sind.
- TypeScript erhöht die Sicherheit beim Arbeiten mit dem fachlichen Datenmodell aus `docs/spec.md`.
- Prisma bildet das relationale Modell lesbar im Repo ab, erzeugt nachvollziehbare Migrationen und liefert einen typisierten Client.
- SQLite ist laut Spec verpflichtend, lokal leicht betreibbar und für ein frühes, minimal lauffähiges System ausreichend.

## Persistenz

SQLite ist verpflichtend und wird über Prisma verwaltet.

Konsequenzen:

- Relationale Modellierung bleibt der Default.
- Fremdschluessel und Constraints sollen fachliche Regeln absichern, soweit SQLite sie praktikabel abbildet.
- Versionierte Ablaufpläne und verbindliche Kommunikation müssen historisch nachvollziehbar bleiben.
- Migrationen liegen unter `prisma/migrations/`.
- Die lokale Entwicklungsdatenbank `prisma/dev.db` wird nicht versioniert.

## Fachliches Kernmodell

Die initiale Datenmodellierung orientiert sich an diesen Entitäten aus `docs/spec.md`:

- Event
- Gast
- Dienstleister
- Ablaufplan
- Ablaufpunkt
- Aufgabe
- Kommunikation
- Budget-Position
- Event_Dienstleister

## Wichtige fachliche Invarianten

- Pro Event darf nur ein Ablaufplan als aktuell markiert sein.
- Änderungen an Ablaufplänen erzeugen neue Versionen.
- Aufgaben mit Abhängigkeit dürfen erst abgeschlossen werden, wenn die Vorgänger-Aufgabe erledigt ist.
- Nur Kommunikation mit `ist_verbindlich = true` ist fachlich verbindlich.
- Dienstleister-Ausfälle müssen betroffene Aufgaben und Ablaufpunkte sichtbar machen.
- Änderungen der Gästeanzahl markieren betroffene Aufgaben und Budgetbereiche als prüfbedürftig.

## Noch offen

Vor der fachlichen Implementierung noch klären und in `docs/decisions.md` dokumentieren:

- Authentifizierung und Rollenmodell, falls Kundenansicht oder Assistenzrollen benötigt werden.
- Deployment-Ziel und Backup-Strategie für die SQLite-Datenbank.

## Projektstruktur

Geplante Dokumentstruktur:

```text
.
|-- AGENTS.md
|-- package.json
|-- prisma/
|   |-- schema.prisma
|   `-- migrations/
|-- src/
|   |-- app/
|   |-- generated/prisma/
|   `-- lib/prisma.ts
`-- docs/
    |-- README.md
    |-- spec.md
    |-- backlog.md
    |-- architecture.md
    |-- decisions.md
    |-- modus-operandi.md
    |-- concepts/
    `-- audit/
```

Keine `prd.md`, keine Meeting-Ordner, keine Results-Ordner.
