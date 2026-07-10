# decisions.md - Architektur- und Produktentscheidungen

_Chronologisches Log aller Entscheidungen, die spaeter nachvollziehbar sein muessen._

---

## 2026-07-10 - Spec ersetzt PRD

**Kontext:** Die Modus-Operandi-Methodik nutzt normalerweise `docs/prd.md` als strategische Produktquelle. In diesem Projekt existiert bereits `docs/spec.md` aus der Discovery und soll diese Rolle uebernehmen.

### Entscheidung

`docs/spec.md` ist die fachliche Single Source of Truth. Es wird keine `prd.md` angelegt.

### Alternativen verworfen

- `spec.md` nach `prd.md` kopieren: Wuerde doppelte Pflege und Drift erzeugen.
- Zusaetzliche `prd.md` aus Template anlegen: Fuer den aktuellen Solo-Scope zu schwergewichtig.

### Konsequenzen

- Agenten und Menschen lesen fuer Scope und fachliche Anforderungen zuerst `docs/spec.md`.
- Methodik-Verweise auf `prd.md` werden projektspezifisch als Verweis auf `docs/spec.md` interpretiert.

---

## 2026-07-10 - Solo-Setup ohne Team-Artefakte

**Kontext:** Das Projekt wird solo gefuehrt. Die Referenzmethodik enthaelt optionale Team-Strukturen wie Meetings, Results, Mission-Dokumente und INBOX.

### Entscheidung

Das Projekt nutzt nur die Solo-relevanten Artefakte: `AGENTS.md`, `docs/spec.md`, `docs/architecture.md`, `docs/decisions.md`, `docs/modus-operandi.md`, `docs/concepts/` und `docs/audit/`.

### Alternativen verworfen

- Meeting- und Results-Ordner vorab anlegen: Nicht noetig und erzeugt ungenutzte Struktur.
- `INBOX.md` vorab anlegen: Solo-sequenziell aktuell nicht notwendig.
- `backlog.md` sofort anlegen: Erst sinnvoll, wenn Feature-IDs und operatives Status-Tracking gebraucht werden.

### Konsequenzen

- Die Dokumentation bleibt schlank.
- Neue Artefakte werden erst eingefuehrt, wenn ein konkreter Bedarf entsteht.

---

## 2026-07-10 - Next.js, Prisma und SQLite als App-Stack

**Kontext:** Das Projekt braucht ein initiales App-Grundgeruest fuer ein Solo-Projekt. Die Spec setzt SQLite als verpflichtende Datenbank.

### Entscheidung

Das Projekt verwendet Next.js 16 mit App Router und TypeScript, Prisma 7 als ORM und SQLite als lokale Datenbank.

### Alternativen verworfen

- Separates Frontend plus Backend: Fuer den aktuellen Solo-Scope zu viel Infrastruktur.
- Direkte SQL-Zugriffe ohne ORM: Weniger Typisierung und weniger nachvollziehbare Migrationen.
- PostgreSQL oder andere Serverdatenbanken: Widerspricht der aktuellen Spec-Vorgabe SQLite.

### Konsequenzen

- App-Code liegt unter `src/`.
- Prisma-Schema und Migrationen liegen unter `prisma/`.
- Der Prisma Client wird nach `src/generated/prisma` generiert.
- Die lokale SQLite-Datenbank liegt unter `prisma/dev.db` und wird nicht versioniert.

---

## 2026-07-10 - Initiales Prisma-Datenmodell aus Spec

**Kontext:** Die Kernentitaeten aus `docs/spec.md` muessen vor der Implementierung als Datenbankschema verfuegbar sein.

### Entscheidung

Das initiale Prisma-Schema bildet Event, Gast, Dienstleister, Ablaufplan, Ablaufpunkt, Aufgabe, Kommunikation, BudgetPosition und EventDienstleister ab.

### Alternativen verworfen

- Schema spaeter aus der UI ableiten: Risiko fuer Drift zur Spec.
- Nur Platzhaltermodell anlegen: Keine brauchbare Basis fuer Phase 1.

### Konsequenzen

- F001 bis F009 sind im Datenbankschema begonnen, aber noch keine fertigen Nutzer-Workflows.
- F010 ist als lokale SQLite-Persistenz umgesetzt.
- Geschaeftsregeln aus Phase 2 bleiben separat zu implementieren.

---

## 2026-07-10 - Prisma 7 mit SQLite-Adapter

**Kontext:** Prisma 7 erwartet fuer SQLite einen Driver Adapter. Der parameterlose PrismaClient kompiliert nicht.

### Entscheidung

Der Prisma Client wird mit `@prisma/adapter-better-sqlite3` initialisiert. Der generierte Client bleibt unter `src/generated/prisma` und wird nicht versioniert.

### Alternativen verworfen

- Generierten Client committen: Erzeugt unnoetigen Versionsrauschen.
- Aeltere Prisma-Version verwenden: Nicht noetig, der Adapter loest das Problem.

### Konsequenzen

- `postinstall` fuehrt `prisma generate` aus.
- `src/lib/prisma.ts` ist die zentrale Prisma-Client-Instanz.
- `.env.example` dokumentiert `DATABASE_URL="file:./prisma/dev.db"`.

---

<!-- Vorlage fuer neue Entscheidungen:

## JJJJ-MM-TT - Titel der Entscheidung

**Kontext:** Warum mussten wir entscheiden?

### Entscheidung
Was wurde entschieden?

### Alternativen verworfen
- Option A: Warum nicht?
- Option B: Warum nicht?

### Konsequenzen
- Positiv
- Negativ / Risiken

-->
