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

## 2026-07-10 - Event-Zentrale als Root-Dashboard

**Kontext:** F001 verlangt ein zentrales Event-Objekt als Einstieg in alle weiteren Arbeitsbereiche.

### Entscheidung

Die Startseite `/` ist die Event-Zentrale. Sie liest Events serverseitig ueber Prisma, bietet ein Formular zum Anlegen, Statuswechsel und Loeschen per Server Actions und zeigt Kennzahlen fuer Events, Gaeste und Budget.

### Alternativen verworfen

- Separate Detailseiten vor F002-F008: Fuer F001 zu gross und noch ohne fachliche Detailfunktionen.
- Clientseitige API-Schicht: Nicht noetig, Server Components und Server Actions reichen fuer diesen MVP-Schritt.

### Konsequenzen

- F001 ist als nutzbarer Event-Einstieg umgesetzt.
- Die Seite ist `force-dynamic`, damit SQLite-Daten nicht als Build-Snapshot ausgeliefert werden.
- Detailfunktionen fuer Gaeste, Ablauf, Aufgaben, Kommunikation, Budget und Dienstleister bleiben eigene Backlog-Features.

---

## 2026-07-10 - Gaesteverwaltung in Event-Karten

**Kontext:** F002 verlangt eine Gaesteverwaltung, die direkt an Events haengt und Grundlage fuer Gaestezahlen sowie spaetere Wartelistenlogik ist.

### Entscheidung

Gaeste werden innerhalb der Event-Karten gepflegt. Pro Event koennen Gaeste angelegt, mit Kontaktdaten, Typ, Anmeldestatus und Anforderungen erfasst, im Status geaendert und geloescht werden.

### Alternativen verworfen

- Eigene Gast-Detailseiten: Fuer den MVP-Schritt zu schwergewichtig.
- Gaeste als freie Notizen am Event: Nicht strukturiert genug fuer Status, Typen und spaetere Wartelistenlogik.

### Konsequenzen

- F002 ist als nutzbare Event-bezogene Gaesteverwaltung umgesetzt.
- Die aktuelle Gaestezahl wird aus nicht abgesagten Gaesten synchronisiert.
- Die Pruefbedarfsregel bei Gaestezahlsaenderungen bleibt F010.

---

## 2026-07-10 - Zentrale Dienstleisterverwaltung

**Kontext:** F003 verlangt eine Verwaltung externer Anbieter mit Kategorie, Kontaktinformationen, Zuverlaessigkeitsnotiz und optionalem Backup-Bezug.

### Entscheidung

Dienstleister werden in einem eigenen Bereich auf der Startseite gepflegt. Anbieter koennen angelegt und geloescht werden; ein Dienstleister kann als Backup fuer einen anderen Dienstleister referenziert werden.

### Alternativen verworfen

- Dienstleister direkt in Event-Karten verwalten: Vermischt Stammdaten mit der spaeteren Event-Zuordnung aus F008.
- Backup-Beziehungen als Freitext erfassen: Nicht belastbar fuer spaetere Ausfall- und Eskalationslogik.

### Konsequenzen

- F003 ist als zentrale Dienstleister-Stammdatenverwaltung umgesetzt.
- Event-spezifische Vertragsdaten, Status und Stornofristen bleiben F008.
- Die Ausfalleskalation bleibt F014.

---

## 2026-07-10 - Ablaufplanung pro Event

**Kontext:** F004 verlangt Ablaufplaene pro Event mit einzelnen Ablaufpunkten, Zeiten, Verantwortlichen, Pufferkennzeichen und Dienstleister-Sichtbarkeit.

### Entscheidung

Ablaufplanung wird innerhalb der Event-Karten gepflegt. Pro Event kann ein aktueller Ablaufplan v1 angelegt werden; darin koennen Ablaufpunkte erfasst und geloescht werden.

### Alternativen verworfen

- Separate Ablaufseiten: Fuer den MVP zu schwergewichtig.
- Versionierung direkt in F004 bauen: Gehoert laut Backlog zu F011.

### Konsequenzen

- F004 ist als nutzbare Ablaufplanung umgesetzt.
- Ablaufpunkte werden chronologisch sortiert angezeigt.
- Versionierung, Wechsel der aktuellen Version und Historie bleiben F011.

---

## 2026-07-10 - Aufgabensteuerung in Event-Karten

**Kontext:** F005 verlangt Aufgaben pro Event mit Faelligkeit, Status, optionaler Abhaengigkeit, Zuweisung und Erinnerung.

### Entscheidung

Aufgaben werden innerhalb der Event-Karten gepflegt. Pro Event koennen Aufgaben angelegt, im Status geaendert, geloescht und optional mit einer Vorgaenger-Aufgabe verknuepft werden.

### Alternativen verworfen

- Eigenes Aufgabenmodul vor dem MVP: Zu gross fuer den aktuellen Arbeitsschritt.
- Abhaengigkeiten nur als Text speichern: Nicht ausreichend fuer spaetere Regelpruefung.

### Konsequenzen

- F005 ist als nutzbare Aufgabensteuerung umgesetzt.
- Abhaengigkeiten sind strukturiert im Datenmodell vorhanden.
- Die harte Regel, dass abhaengige Aufgaben erst nach erledigter Vorgaenger-Aufgabe erledigt werden duerfen, bleibt F013.

---

## 2026-07-10 - Kommunikationsprotokoll in Event-Karten

**Kontext:** F006 verlangt nachvollziehbare Kommunikationsvorgaenge pro Event mit Kanal, Datum, Inhalt, Beteiligten, Ersteller und Verbindlichkeitskennzeichen.

### Entscheidung

Kommunikation wird innerhalb der Event-Karten protokolliert. Pro Event koennen Eintraege angelegt, geloescht und nach Datum absteigend angezeigt werden.

### Alternativen verworfen

- Separate Kommunikationsseiten: Fuer den MVP zu schwergewichtig.
- Kommunikation als Event-Notiz: Nicht strukturiert genug fuer Kanal, Beteiligte und Verbindlichkeit.

### Konsequenzen

- F006 ist als nutzbares Kommunikationsprotokoll umgesetzt.
- Verbindliche Eintraege sind sichtbar von unverbindlichen Notizen getrennt.
- Die fachliche Regel, dass nur verbindliche Kommunikation als Grundlage gilt, bleibt F012.

---

## 2026-07-10 - Budgetuebersicht in Event-Karten

**Kontext:** F007 verlangt Budgetpositionen pro Event mit Angebotsbetrag, bestaetigtem Betrag, bezahltem Betrag und optionalem Dienstleisterbezug.

### Entscheidung

Budgetpositionen werden innerhalb der Event-Karten gepflegt. Pro Event werden Summen fuer Angebot, bestaetigte Kosten und bezahlte Kosten angezeigt; einzelne Positionen koennen optional einem zentralen Dienstleister zugeordnet werden.

### Alternativen verworfen

- Eigenes Budgetmodul vor dem MVP: Fuer den aktuellen Kernumfang zu gross.
- Budget als Freitext am Event: Nicht auswertbar fuer Zahlungsstand und Dienstleisterbezug.

### Konsequenzen

- F007 ist als nutzbare Budgetuebersicht umgesetzt.
- Budgetpositionen bleiben eventbezogen und nutzen die vorhandene Dienstleister-Stammdatenverwaltung.
- Die Pruefbedarfsregel bei Gaestezahlsaenderungen bleibt F010.

---

## 2026-07-10 - Event-Dienstleister-Zuordnung in Event-Karten

**Kontext:** F008 verlangt eine n:m-Zuordnung zwischen Events und Dienstleistern mit Status, Vertrags-URL und Stornofrist.

### Entscheidung

Event-Dienstleister-Zuordnungen werden innerhalb der Event-Karten gepflegt. Die Zuordnung nutzt die zentrale Dienstleister-Stammdatenverwaltung und speichert Status, optionale Vertrags-URL und optionale Stornofrist im bestehenden `EventDienstleister`-Modell.

### Alternativen verworfen

- Dienstleisterdaten pro Event duplizieren: Wuerde Stammdaten und Event-Zuordnung vermischen.
- Zuordnungen nur ueber Budgetpositionen abbilden: Nicht ausreichend fuer Vertragsstatus und Stornofrist.

### Konsequenzen

- F008 ist als nutzbare Event-Dienstleister-Zuordnung umgesetzt.
- Dienstleister koennen pro Event angelegt, bearbeitet und entfernt werden, ohne die Stammdaten zu loeschen.
- Ausfall- und Eskalationslogik bleibt F014.

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
