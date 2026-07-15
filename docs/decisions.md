# decisions.md - Architektur- und Produktentscheidungen

_Chronologisches Log aller Entscheidungen, die später nachvollziehbar sein müssen._

---

## 2026-07-10 - Spec ersetzt PRD

**Kontext:** Die Modus-Operandi-Methodik nutzt normalerweise `docs/prd.md` als strategische Produktquelle. In diesem Projekt existiert bereits `docs/spec.md` aus der Discovery und soll diese Rolle übernehmen.

### Entscheidung

`docs/spec.md` ist die fachliche Single Source of Truth. Es wird keine `prd.md` angelegt.

### Alternativen verworfen

- `spec.md` nach `prd.md` kopieren: Würde doppelte Pflege und Drift erzeugen.
- Zusätzliche `prd.md` aus Template anlegen: Für den aktuellen Solo-Scope zu schwergewichtig.

### Konsequenzen

- Agenten und Menschen lesen für Scope und fachliche Anforderungen zuerst `docs/spec.md`.
- Methodik-Verweise auf `prd.md` werden projektspezifisch als Verweis auf `docs/spec.md` interpretiert.

---

## 2026-07-10 - Solo-Setup ohne Team-Artefakte

**Kontext:** Das Projekt wird solo geführt. Die Referenzmethodik enthält optionale Team-Strukturen wie Meetings, Results, Mission-Dokumente und INBOX.

### Entscheidung

Das Projekt nutzt nur die Solo-relevanten Artefakte: `AGENTS.md`, `docs/spec.md`, `docs/architecture.md`, `docs/decisions.md`, `docs/modus-operandi.md`, `docs/concepts/` und `docs/audit/`.

### Alternativen verworfen

- Meeting- und Results-Ordner vorab anlegen: Nicht nötig und erzeugt ungenutzte Struktur.
- `INBOX.md` vorab anlegen: Solo-sequenziell aktuell nicht notwendig.
- `backlog.md` sofort anlegen: Erst sinnvoll, wenn Feature-IDs und operatives Status-Tracking gebraucht werden.

### Konsequenzen

- Die Dokumentation bleibt schlank.
- Neue Artefakte werden erst eingeführt, wenn ein konkreter Bedarf entsteht.

---

## 2026-07-10 - Next.js, Prisma und SQLite als App-Stack

**Kontext:** Das Projekt braucht ein initiales App-Grundgerüst für ein Solo-Projekt. Die Spec setzt SQLite als verpflichtende Datenbank.

### Entscheidung

Das Projekt verwendet Next.js 16 mit App Router und TypeScript, Prisma 7 als ORM und SQLite als lokale Datenbank.

### Alternativen verworfen

- Separates Frontend plus Backend: Für den aktuellen Solo-Scope zu viel Infrastruktur.
- Direkte SQL-Zugriffe ohne ORM: Weniger Typisierung und weniger nachvollziehbare Migrationen.
- PostgreSQL oder andere Serverdatenbanken: Widerspricht der aktuellen Spec-Vorgabe SQLite.

### Konsequenzen

- App-Code liegt unter `src/`.
- Prisma-Schema und Migrationen liegen unter `prisma/`.
- Der Prisma Client wird nach `src/generated/prisma` generiert.
- Die lokale SQLite-Datenbank liegt unter `prisma/dev.db` und wird nicht versioniert.

---

## 2026-07-10 - Initiales Prisma-Datenmodell aus Spec

**Kontext:** Die Kernentitäten aus `docs/spec.md` müssen vor der Implementierung als Datenbankschema verfügbar sein.

### Entscheidung

Das initiale Prisma-Schema bildet Event, Gast, Dienstleister, Ablaufplan, Ablaufpunkt, Aufgabe, Kommunikation, BudgetPosition und EventDienstleister ab.

### Alternativen verworfen

- Schema später aus der UI ableiten: Risiko für Drift zur Spec.
- Nur Platzhaltermodell anlegen: Keine brauchbare Basis für Phase 1.

### Konsequenzen

- F001 bis F009 sind im Datenbankschema begonnen, aber noch keine fertigen Nutzer-Workflows.
- F009 ist als lokale SQLite-Persistenz umgesetzt.
- Geschäftsregeln aus Phase 2 bleiben separat zu implementieren.

---

## 2026-07-10 - Prisma 7 mit SQLite-Adapter

**Kontext:** Prisma 7 erwartet für SQLite einen Driver Adapter. Der parameterlose PrismaClient kompiliert nicht.

### Entscheidung

Der Prisma Client wird mit `@prisma/adapter-better-sqlite3` initialisiert. Der generierte Client bleibt unter `src/generated/prisma` und wird nicht versioniert.

### Alternativen verworfen

- Generierten Client committen: Erzeugt unnötigen Versionsrauschen.
- Ältere Prisma-Version verwenden: Nicht nötig, der Adapter löst das Problem.

### Konsequenzen

- `postinstall` fuehrt `prisma generate` aus.
- `src/lib/prisma.ts` ist die zentrale Prisma-Client-Instanz.
- `.env.example` dokumentiert `DATABASE_URL="file:./prisma/dev.db"`.

---

## 2026-07-10 - Event-Zentrale als Root-Dashboard

**Kontext:** F001 verlangt ein zentrales Event-Objekt als Einstieg in alle weiteren Arbeitsbereiche.

### Entscheidung

Die Startseite `/` ist die Event-Zentrale. Sie liest Events serverseitig über Prisma, bietet ein Formular zum Anlegen, Statuswechsel und Löschen per Server Actions und zeigt Kennzahlen für Events, Gäste und Budget.

### Alternativen verworfen

- Separate Detailseiten vor F002-F008: Für F001 zu groß und noch ohne fachliche Detailfunktionen.
- Clientseitige API-Schicht: Nicht nötig, Server Components und Server Actions reichen für diesen MVP-Schritt.

### Konsequenzen

- F001 ist als nutzbarer Event-Einstieg umgesetzt.
- Die Seite ist `force-dynamic`, damit SQLite-Daten nicht als Build-Snapshot ausgeliefert werden.
- Detailfunktionen für Gäste, Ablauf, Aufgaben, Kommunikation, Budget und Dienstleister bleiben eigene Backlog-Features.

---

## 2026-07-10 - Gästeverwaltung in Event-Karten

**Kontext:** F002 verlangt eine Gästeverwaltung, die direkt an Events hängt und Grundlage für Gästezahlen sowie spätere Wartelistenlogik ist.

### Entscheidung

Gäste werden innerhalb der Event-Karten gepflegt. Pro Event können Gäste angelegt, mit Kontaktdaten, Typ, Anmeldestatus und Anforderungen erfasst, im Status geändert und gelöscht werden.

### Alternativen verworfen

- Eigene Gast-Detailseiten: Für den MVP-Schritt zu schwergewichtig.
- Gäste als freie Notizen am Event: Nicht strukturiert genug für Status, Typen und spätere Wartelistenlogik.

### Konsequenzen

- F002 ist als nutzbare Event-bezogene Gästeverwaltung umgesetzt.
- Die aktuelle Gästezahl wird aus nicht abgesagten Gästen synchronisiert.
- Die Prüfbedarfsregel bei Gästezahlsaenderungen bleibt F010.

---

## 2026-07-10 - Zentrale Dienstleisterverwaltung

**Kontext:** F003 verlangt eine Verwaltung externer Anbieter mit Kategorie, Kontaktinformationen, Zuverlässigkeitsnotiz und optionalem Backup-Bezug.

### Entscheidung

Dienstleister werden in einem eigenen Bereich auf der Startseite gepflegt. Anbieter können angelegt und gelöscht werden; ein Dienstleister kann als Backup für einen anderen Dienstleister referenziert werden.

### Alternativen verworfen

- Dienstleister direkt in Event-Karten verwalten: Vermischt Stammdaten mit der späteren Event-Zuordnung aus F008.
- Backup-Beziehungen als Freitext erfassen: Nicht belastbar für spätere Ausfall- und Eskalationslogik.

### Konsequenzen

- F003 ist als zentrale Dienstleister-Stammdatenverwaltung umgesetzt.
- Event-spezifische Vertragsdaten, Status und Stornofristen bleiben F008.
- Die Ausfalleskalation bleibt F014.

---

## 2026-07-10 - Ablaufplanung pro Event

**Kontext:** F004 verlangt Ablaufpläne pro Event mit einzelnen Ablaufpunkten, Zeiten, Verantwortlichen, Pufferkennzeichen und Dienstleister-Sichtbarkeit.

### Entscheidung

Ablaufplanung wird innerhalb der Event-Karten gepflegt. Pro Event kann ein aktueller Ablaufplan v1 angelegt werden; darin können Ablaufpunkte erfasst und gelöscht werden.

### Alternativen verworfen

- Separate Ablaufseiten: Für den MVP zu schwergewichtig.
- Versionierung direkt in F004 bauen: Gehört laut Backlog zu F011.

### Konsequenzen

- F004 ist als nutzbare Ablaufplanung umgesetzt.
- Ablaufpunkte werden chronologisch sortiert angezeigt.
- Versionierung, Wechsel der aktuellen Version und Historie bleiben F011.

---

## 2026-07-10 - Aufgabensteuerung in Event-Karten

**Kontext:** F005 verlangt Aufgaben pro Event mit Fälligkeit, Status, optionaler Abhängigkeit, Zuweisung und Erinnerung.

### Entscheidung

Aufgaben werden innerhalb der Event-Karten gepflegt. Pro Event können Aufgaben angelegt, im Status geändert, gelöscht und optional mit einer Vorgänger-Aufgabe verknüpft werden.

### Alternativen verworfen

- Eigenes Aufgabenmodul vor dem MVP: Zu groß für den aktuellen Arbeitsschritt.
- Abhängigkeiten nur als Text speichern: Nicht ausreichend für spätere Regelprüfung.

### Konsequenzen

- F005 ist als nutzbare Aufgabensteuerung umgesetzt.
- Abhängigkeiten sind strukturiert im Datenmodell vorhanden.
- Die harte Regel, dass abhängige Aufgaben erst nach erledigter Vorgänger-Aufgabe erledigt werden dürfen, bleibt F013.

---

## 2026-07-10 - Kommunikationsprotokoll in Event-Karten

**Kontext:** F006 verlangt nachvollziehbare Kommunikationsvorgänge pro Event mit Kanal, Datum, Inhalt, Beteiligten, Ersteller und Verbindlichkeitskennzeichen.

### Entscheidung

Kommunikation wird innerhalb der Event-Karten protokolliert. Pro Event können Einträge angelegt, gelöscht und nach Datum absteigend angezeigt werden.

### Alternativen verworfen

- Separate Kommunikationsseiten: Für den MVP zu schwergewichtig.
- Kommunikation als Event-Notiz: Nicht strukturiert genug für Kanal, Beteiligte und Verbindlichkeit.

### Konsequenzen

- F006 ist als nutzbares Kommunikationsprotokoll umgesetzt.
- Verbindliche Einträge sind sichtbar von unverbindlichen Notizen getrennt.
- Die fachliche Regel, dass nur verbindliche Kommunikation als Grundlage gilt, bleibt F012.

---

## 2026-07-10 - Budgetübersicht in Event-Karten

**Kontext:** F007 verlangt Budgetpositionen pro Event mit Angebotsbetrag, bestätigtem Betrag, bezahltem Betrag und optionalem Dienstleisterbezug.

### Entscheidung

Budgetpositionen werden innerhalb der Event-Karten gepflegt. Pro Event werden Summen für Angebot, bestätigte Kosten und bezahlte Kosten angezeigt; einzelne Positionen können optional einem zentralen Dienstleister zugeordnet werden.

### Alternativen verworfen

- Eigenes Budgetmodul vor dem MVP: Für den aktuellen Kernumfang zu groß.
- Budget als Freitext am Event: Nicht auswertbar für Zahlungsstand und Dienstleisterbezug.

### Konsequenzen

- F007 ist als nutzbare Budgetübersicht umgesetzt.
- Budgetpositionen bleiben eventbezogen und nutzen die vorhandene Dienstleister-Stammdatenverwaltung.
- Die Prüfbedarfsregel bei Gästezahlsaenderungen bleibt F010.

---

## 2026-07-10 - Event-Dienstleister-Zuordnung in Event-Karten

**Kontext:** F008 verlangt eine n:m-Zuordnung zwischen Events und Dienstleistern mit Status, Vertrags-URL und Stornofrist.

### Entscheidung

Event-Dienstleister-Zuordnungen werden innerhalb der Event-Karten gepflegt. Die Zuordnung nutzt die zentrale Dienstleister-Stammdatenverwaltung und speichert Status, optionale Vertrags-URL und optionale Stornofrist im bestehenden `EventDienstleister`-Modell.

### Alternativen verworfen

- Dienstleisterdaten pro Event duplizieren: Würde Stammdaten und Event-Zuordnung vermischen.
- Zuordnungen nur über Budgetpositionen abbilden: Nicht ausreichend für Vertragsstatus und Stornofrist.

### Konsequenzen

- F008 ist als nutzbare Event-Dienstleister-Zuordnung umgesetzt.
- Dienstleister können pro Event angelegt, bearbeitet und entfernt werden, ohne die Stammdaten zu löschen.
- Ausfall- und Eskalationslogik bleibt F014.

---

## 2026-07-10 - Lokale SQLite-Persistenz als Kernbasis

**Kontext:** F009 verlangt SQLite als lokale Datenbank und eine relationale Abbildung der fachlichen Kernobjekte aus `docs/spec.md`.

### Entscheidung

SQLite bleibt die lokale Datenbank unter `prisma/dev.db`. Prisma verwaltet das relationale Kernmodell über `prisma/schema.prisma` und Migrationen unter `prisma/migrations/`; der Zugriff erfolgt zentral über `src/lib/prisma.ts`.

### Alternativen verworfen

- Andere Datenbank für den MVP: Widerspricht der Spec-Vorgabe.
- Persistenz ohne Migrationen: Nicht nachvollziehbar genug für ein wachsendes Kernmodell.

### Konsequenzen

- F009 ist als technische Persistenzbasis umgesetzt.
- Die lokale Datenbankdatei bleibt nicht versioniert.
- Ein Test prüft SQLite-Konfiguration und vorhandene Kernmodelle.

---

## 2026-07-10 - Formular-Parser-Helfer zentralisieren

**Kontext:** Beim Codequalitätsdurchlauf nach F009 fielen mehrfach duplizierte Hilfsfunktionen für optionale Texte, IDs, Datumswerte und Geldwerte in den fachlichen Input-Parsern auf.

### Entscheidung

Neutrale Formular-Normalisierung liegt zentral in `src/lib/form-input.ts`. Fachliche Parser behalten ihre Pflichtfeld-, Status- und Entitätsregeln, verwenden aber gemeinsame Helfer für wiederkehrende Eingabetypen.

### Alternativen verworfen

- Duplikate in jedem Parser behalten: Erhöht Wartungsaufwand und Risiko auseinanderlaufender Validierung.
- Parser komplett generisch machen: Für den aktuellen Scope zu abstrakt und schlechter lesbar.

### Konsequenzen

- Die Parser enthalten weniger doppelte Logik.
- Bestehendes Verhalten bleibt durch die vorhandenen Unit-Tests abgesichert.
- Neue Formular-Parser können gemeinsame Helfer wiederverwenden.

---

## 2026-07-10 - Prüfbedarf bei Gästezahlsaenderung

**Kontext:** F010 verlangt, dass Änderungen der aktuellen Gästezahl betroffene Aufgaben und Budgetbereiche als prüfbedürftig markieren.

### Entscheidung

Die Gästezahl-Synchronisierung vergleicht den neu berechneten Wert mit der gespeicherten aktuellen Gästezahl. Nur bei einer echten Änderung werden das Event, alle Aufgaben des Events und alle Budgetpositionen des Events als prüfbedürftig markiert.

### Alternativen verworfen

- Immer nach jeder Gästeaktion markieren: Würde auch Statuswechsel ohne Auswirkung unnötig eskalieren.
- Nur das Event markieren: Aufgaben und Budgetpositionen wären nicht direkt sichtbar betroffen.

### Konsequenzen

- F010 ist als Geschäftsregel umgesetzt.
- Prüfbedarf ist in Event-Karten, Aufgaben und Budgetpositionen sichtbar.
- Eine spätere Funktion zum Zurücksetzen von Prüfbedarf ist noch nicht Teil des Backlogs.

---

## 2026-07-15 - Versionierte Ablaufpläne

**Kontext:** F011 verlangt, dass Änderungen an Ablaufplänen neue Versionen erzeugen und pro Event nur eine Version aktuell ist.

### Entscheidung

Ablaufpunkte werden nicht mehr direkt im aktuellen Ablaufplan verändert. Beim Hinzufuegen oder Löschen eines Ablaufpunkts wird der aktuelle Ablaufplan archiviert und eine neue aktuelle Version mit kopierten Ablaufpunkten plus Änderung erstellt.

### Alternativen verworfen

- Ablaufpunkte direkt mutieren: Historie wäre verloren.
- Separate Detailseite für Versionsverwaltung: Für die bestehende Event-Karten-UI zu groß.

### Konsequenzen

- F011 ist als versionierte Ablaufplanung umgesetzt.
- Die Event-Karte zeigt die Ablaufversionen und markiert die aktuelle Version.
- Das Datenmodell bleibt unverändert, weil Version und `istAktuell` bereits vorhanden waren.

---

## 2026-07-15 - Verbindliche Kommunikation als Grundlage

**Kontext:** F012 verlangt, dass nur Kommunikation mit `ist_verbindlich = true` als verbindliche Grundlage gilt.

### Entscheidung

Verbindlichkeit wird fachlich ausschliesslich über `istVerbindlich` bestimmt. Die Event-Karte zeigt verbindliche Grundlagen separat und filtert unverbindliche Kommunikationsnotizen aus dieser Grundlage heraus.

### Alternativen verworfen

- Alle Kommunikationsereignisse als Grundlage behandeln: Widerspricht der Spec-Regel.
- Verbindlichkeit aus Kanal oder Text ableiten: Zu fehleranfällig und nicht explizit genug.

### Konsequenzen

- F012 ist als explizite Geschäftsregel umgesetzt.
- Unverbindliche Kontakte bleiben im Kommunikationsprotokoll sichtbar, zählen aber nicht als Grundlage.
- Die Regel ist durch einen eigenen Helper mit Unit-Test abgesichert.

---

## 2026-07-15 - Aufgabenabhängigkeiten erzwingen

**Kontext:** F013 verlangt, dass abhängige Aufgaben erst erledigt werden dürfen, wenn ihre Vorgänger-Aufgabe erledigt ist.

### Entscheidung

Der Statuswechsel auf `erledigt` wird serverseitig blockiert, solange eine verknuepfte Vorgänger-Aufgabe nicht erledigt ist. Die Event-Karte markiert solche Aufgaben mit einem Blockiert-Badge.

### Alternativen verworfen

- Nur visuell warnen: Würde unzulässige Statuswechsel nicht verhindern.
- Einen neuen Status `blockiert` einführen: Widerspricht den Statuswerten aus der Spec.

### Konsequenzen

- F013 ist als wirksame Geschäftsregel umgesetzt.
- Blockierte Aufgaben bleiben im bestehenden Statusmodell sichtbar.
- Die Regel ist durch einen eigenen Helper mit Unit-Test abgesichert.

---

## 2026-07-15 - Dienstleister-Ausfalleskalation

**Kontext:** F014 verlangt sichtbare Eskalation, wenn ein kritischer Dienstleister ausfällt.

### Entscheidung

Event-Dienstleister-Zuordnungen können als kritisch markiert und auf `ausgefallen` gesetzt werden. Sobald mindestens ein kritischer Dienstleister eines Events ausgefallen ist, werden alle Aufgaben und die Ablaufpunkte des aktuellen Ablaufplans dieses Events als eskaliert markiert.

### Alternativen verworfen

- Ausfall nur als Status anzeigen: Würde betroffene operative Elemente nicht sichtbar machen.
- Feingranulare Zuordnung einzelner Aufgaben und Ablaufpunkte zu Dienstleistern: Im aktuellen Datenmodell nicht vorhanden und für F014 zu groß.

### Konsequenzen

- F014 ist als sichtbare Eskalationsregel umgesetzt.
- Beim Auflösen oder Entfernen kritischer Ausfälle wird die Eskalation für das Event neu berechnet.
- Konfigurierbare Eskalationslogik bleibt F019.

---

## 2026-07-15 - Keine direkte Dienstleister-Änderungseinreichung

**Kontext:** F015 verlangt die Klärung, ob Dienstleister Änderungen selbst einreichen dürfen.

### Entscheidung

Dienstleister erhalten im aktuellen Solo-Projekt keinen direkten Schreibzugriff und reichen keine Änderungen im System ein. Änderungen werden extern angenommen, vom Event-Team geprüft und danach intern eingetragen.

### Alternativen verworfen

- Externe Änderungsvorschlaege im System: Ohne Rollen- und Rechtekonzept zu riskant.
- Automatisches Überschreiben von Planungsdaten: Würde verbindliche Daten ungeprüft verändern.

### Konsequenzen

- F015 ist fachlich entschieden und in `docs/concepts/dienstleister-aenderungseinreichung.md` dokumentiert.
- Verbindliche externe Zusagen werden über das Kommunikationsprotokoll festgehalten.
- Ein externer Freigabe-Workflow bleibt ausserhalb des aktuellen Scopes.

---

## 2026-07-15 - Keine Rollen und Kundenansicht im aktuellen Scope

**Kontext:** F016 verlangt die Klärung, ob Rollen wie Assistenz, Eventmanagerin oder Kundenansicht benötigt werden.

### Entscheidung

Das System bleibt für den aktuellen Solo-Scope eine interne Einzelansicht ohne Rollenmodell und ohne Kundenansicht.

### Alternativen verworfen

- Rollen ohne Authentifizierung einführen: Wäre fachlich irreführend und technisch nicht belastbar.
- Kundenansicht als reine Filteransicht bauen: Ohne Freigabe- und Sichtbarkeitsregeln zu riskant.

### Konsequenzen

- F016 ist fachlich entschieden und in `docs/concepts/rollen-und-kundenansicht.md` dokumentiert.
- Die bestehende App bleibt ein internes Arbeitswerkzeug.
- Ein echtes Rollenmodell bleibt an Authentifizierung und Rechtekonzept gebunden.

---

## 2026-07-15 - Wartelisten-Management nach Event-Kapazität

**Kontext:** F017 verlangt einen kontrollierten Kapazitätsworkflow für Gäste auf der Warteliste.

### Entscheidung

Nur Gäste mit Status `angemeldet` oder `bestaetigt` zählen als aktive Gäste. Wenn die geplante Gästezahl erreicht ist, werden neue aktive Anfragen automatisch auf `warteliste` gesetzt; wird Kapazität frei, rücken Wartelisten-Gäste nach ID-Reihenfolge automatisch auf `bestaetigt` nach.

### Alternativen verworfen

- Warteliste nur als manueller Status: Würde Kapazitäten nicht schützen.
- Zufalls- oder Prioritätslogik: Im aktuellen Datenmodell gibt es keine fachliche Priorität.

### Konsequenzen

- F017 ist als Kapazitätsworkflow umgesetzt.
- Die Event-Karte zeigt aktive Gäste und Wartelisten-Gäste getrennt.
- VIP- oder Prioritätsregeln können später auf dieser Basis ergänzt werden.

---

## 2026-07-15 - Bestehende Tools vorerst ergänzen

**Kontext:** F018 verlangt die Klärung, welche bestehenden Tools ersetzt und welche nur ergänzt werden.

### Entscheidung

Das System ersetzt aktuell keine bestehenden Tools vollständig. Es wird als lokale Planungs- und Steuerungszentrale verstanden; Importe, Exporte und Synchronisationen werden erst nach konkreter Tool-Liste spezifiziert.

### Alternativen verworfen

- Pauschale Tool-Ersetzung: Ohne Ist-Systeme und Datenformate nicht belastbar.
- Generische Import-/Exportfunktionen bauen: Würde Scheingenauigkeit erzeugen und Wartungskosten erhöhen.

### Konsequenzen

- F018 ist fachlich entschieden und in `docs/concepts/tool-ersetzung-und-integration.md` dokumentiert.
- Der aktuelle Scope bleibt integrationsfrei.
- Spätere Integrationen brauchen konkrete Quell- und Zielsysteme.

---

## 2026-07-15 - Eskalationsregeln zentral konfigurieren

**Kontext:** F019 verlangt, dass Eskalationssituationen konfigurierbar werden statt fest verdrahtet zu bleiben.

### Entscheidung

Die Dienstleister-Ausfalleskalation nutzt eine zentrale Konfiguration in `src/lib/escalation-config.ts`. Dort sind der auslösende Status und die betroffenen Zielbereiche hinterlegt.

### Alternativen verworfen

- Regelwerte direkt in Server Actions behalten: Schlechter wartbar und schwerer erweiterbar.
- Datenbankmodell für Regeln einführen: Für den aktuellen Scope zu groß.

### Konsequenzen

- F019 ist als zentrale Code-Konfiguration umgesetzt und in `docs/concepts/konfigurierbare-eskalationen.md` dokumentiert.
- Die bestehende Eskalationsregel bleibt funktional gleich.
- Eine spätere UI für Regelpflege kann auf der zentralen Struktur aufbauen.

---

## 2026-07-15 - Anzeigeformatierung aus der Startseite extrahieren

**Kontext:** Beim projektweiten Codequalitätsdurchlauf fiel auf, dass `src/app/page.tsx` neben Server Actions und UI auch alle Datums-, Währungs- und Label-Formatierer enthielt.

### Entscheidung

Anzeigeformatierung liegt zentral in `src/lib/formatters.ts`. `src/app/page.tsx` importiert diese Helfer und enthält dadurch weniger nicht-seitenspezifische Logik.

### Alternativen verworfen

- Formatierer in der Seite belassen: Erhöht die Größe und erschwert Wiederverwendung.
- Formatierung in mehrere fachliche Einzelmodule zerlegen: Für den aktuellen Umfang zu kleinteilig.

### Konsequenzen

- Die Startseite ist kuerzer und fokussierter.
- Formatierungslogik kann später in weiteren Views wiederverwendet werden.
- Die Geldvalidierung in `src/lib/form-input.ts` nutzt intern eine gemeinsame Parserfunktion für Pflicht- und optionale Geldwerte.

---

## 2026-07-15 - Projektansicht klarer strukturieren

**Kontext:** Die Event-Zentrale wurde mit wachsendem Funktionsumfang unübersichtlich, aggregierte Kopfkennzahlen vermischten mehrere Projekte, und einzelne Arbeitsbereiche waren innerhalb eines Events schwer voneinander zu trennen.

### Entscheidung

Die Startseite zeigt keine projektübergreifenden Budget- und Gästesummen mehr. Jedes Event ist als eigenes Projekt mit eigenen Kennzahlen dargestellt; Detailbereiche wie Budget, Gäste, Ablauf, Aufgaben, Kommunikation und Dienstleister sind als klar getrennte aufklappbare Abschnitte organisiert.

### Alternativen verworfen

- Aggregierte Kopfkennzahlen behalten: Bei mehreren Events schwer interpretierbar.
- Separate Seiten pro Arbeitsbereich sofort einführen: Für den aktuellen App Router Scope zu großer Umbau.

### Konsequenzen

- Events sind visuell stärker voneinander getrennt.
- Die wichtigsten Projektkennzahlen stehen direkt am jeweiligen Event.
- Weniger genutzte Detailbereiche können eingeklappt bleiben.

---

## 2026-07-15 - Stammdaten und Eingaben ergonomischer machen

**Kontext:** Dienstleister mussten bisher gelöscht und neu angelegt werden, der Gäste-Statusbutton war missverständlich, und das native Datumsfeld war für die Event-Erfassung zu umständlich.

### Entscheidung

Dienstleister-Stammdaten können direkt in der Dienstleisterkarte bearbeitet werden. Der Gäste-Statuswechsel ist als Formular mit Label `Neuer Status` und Button `Speichern` formuliert. Das Event-Datum wird in der Neuanlage über getrennte Jahr-, Monat- und Tag-Auswahlfelder erfasst und serverseitig streng validiert.

### Alternativen verworfen

- Statusbutton unverändert lassen: Die Aktion war nicht eindeutig genug.
- Dienstleister nur löschen und neu anlegen: Unnötig fehleranfällig bei bestehenden Zuordnungen.
- Datum nur clientseitig prüfen: Server Actions müssen ungültige Kalenderdaten selbst abweisen.

### Konsequenzen

- Lieferanten können ohne Datenverlust angepasst werden.
- Gäste-Statuswechsel sind in der UI eindeutiger.
- Ungültige kombinierte Datumswerte werden nicht still normalisiert.

---

## 2026-07-15 - Umlaute in sichtbaren Texten

**Kontext:** Die App und Dokumentation enthielten deutsche Wörter mit ASCII-Umschreibungen wie `ae` oder `oe`, obwohl die Oberfläche deutschsprachig ist.

### Entscheidung

Sichtbare deutsche Texte, Fehlermeldungen, Tests und Dokumentation verwenden Umlaute. Technische Identifier, gespeicherte Enum-Werte und Datenbankfelder bleiben stabil, damit Prisma-Schema, Datenbestand und Imports nicht brechen.

### Konsequenzen

- Die Oberfläche und Dokumentation lesen sich natürlicher.
- Code-nahe Namen wie `backupFuerId` oder `bestaetigt` bleiben unverändert.

---

## 2026-07-15 - Dashboard-Design konsolidieren

**Kontext:** Die Oberfläche war funktional, aber optisch uneinheitlich und wirkte bei vielen Event-Details zu gedrängt.

### Entscheidung

Das bestehende Markup bleibt unverändert; das UI wird ausschließlich über `src/app/page.module.css` modernisiert. Die App nutzt ein konsistentes Pastell-Farbsystem, ruhigere Karten, pastellgrüne Formular- und Dropdownfelder, weichere Buttons, klarere Formularflächen, stärkere Abschnittshierarchie und zusätzliche Breakpoints für Tablet und Mobile.

### Konsequenzen

- Die bestehende Funktionalität und alle Form Actions bleiben unverändert.
- Das Dashboard ist auf Desktop und mobilen Breiten besser lesbar.

---

<!-- Vorlage für neue Entscheidungen:

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
