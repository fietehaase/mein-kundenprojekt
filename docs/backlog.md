# backlog.md - Event Management System

_Stand: 2026-07-10_

Stabile Feature-IDs aus `docs/spec.md`. Nicht umnummerieren.

## Phasen

- Phase 1 = Kern: Minimal Viable Product.
- Phase 2 = Geschäftsregeln.
- Phase 3 = Komfort.

## Phase 1 - Kern

### F001 - Event-Zentrale

**Status:** Erledigt

**Ziel:** Das System braucht ein zentrales Event-Objekt als Einstieg in alle weiteren Arbeitsbereiche. Ein Event hält Name, Datum, Status, geplante und aktuelle Gästezahl, Gesamtbudget, Notizen und Erstellzeitpunkt fest. Darauf beziehen sich Ablauf, Aufgaben, Kommunikation, Budget und Dienstleister.

### F002 - Gästeverwaltung

**Status:** Erledigt

**Ziel:** Gäste sollen einem Event zugeordnet und mit Kontaktdaten, Typ, Anmeldestatus und relevanten Anforderungen gepflegt werden. Dazu gehören Ernährung, Allergien, Tischzuweisung und VIP-Anforderungen. Die Funktion bildet die Grundlage für Gästezahlen, Planung und spätere Wartelistenlogik.

### F003 - Dienstleisterverwaltung

**Status:** Erledigt

**Ziel:** Externe Anbieter sollen mit Kategorie, Ansprechpartner, Kontaktinformationen und Zuverlässigkeitsnotiz verwaltet werden. Dienstleister können Events zugeordnet werden und optional einen Backup-Dienstleister referenzieren. Damit entsteht die Grundlage für Ausfall- und Eskalationslogik.

### F004 - Ablaufplanung

**Status:** Erledigt

**Ziel:** Für jedes Event soll ein Ablaufplan mit einzelnen Programmpunkten gepflegt werden. Ablaufpunkte enthalten Start- und Endzeit, Bezeichnung, Verantwortliche, Pufferkennzeichen und Sichtbarkeit für Dienstleister. Die Funktion macht den operativen Event-Ablauf planbar und nachvollziehbar.

### F005 - Aufgabensteuerung

**Status:** Erledigt

**Ziel:** Aufgaben sollen pro Event mit Fälligkeit, Status, Zuweisung und Erinnerung gepflegt werden. Optional kann eine Aufgabe von einer anderen Aufgabe abhängen. Damit wird sichtbar, was bis wann erledigt werden muss und welche Arbeit blockiert ist.

### F006 - Kommunikationsprotokoll

**Status:** Erledigt

**Ziel:** Kommunikationsvorgänge zu einem Event sollen protokolliert werden. Erfasst werden Kanal, Datum, Inhalt, Beteiligte, Ersteller und ob die Kommunikation verbindlich ist. So bleiben Absprachen nachvollziehbar und können später von unverbindlichen Notizen getrennt werden.

### F007 - Budgetübersicht

**Status:** Erledigt

**Ziel:** Kosten sollen pro Event als Budget-Positionen geplant und nachverfolgt werden. Je Position werden Angebotsbetrag, bestätigter Betrag, bezahlter Betrag und optionaler Dienstleisterbezug gespeichert. Dadurch wird sichtbar, welche Kosten geplant, bestätigt und bereits bezahlt sind.

### F008 - Event-Dienstleister-Zuordnung

**Status:** Erledigt

**Ziel:** Events und Dienstleister sollen über eine n:m-Zuordnung verbunden werden. Pro Zuordnung werden Status, Vertrags-URL und Stornofrist dokumentiert. Diese Verbindung bildet die Grundlage für Dienstleisterplanung, Vertragsübersicht und spätere Ausfallbehandlung.

### F009 - Lokale SQLite-Persistenz

**Status:** Erledigt

**Ziel:** Das Backend muss SQLite als lokale Datenbank verwenden. Das Datenmodell soll die fachlichen Kernobjekte aus der Spec relational abbilden. Damit entsteht eine belastbare Grundlage für ein minimal lauffähiges System.

## Phase 2 - Geschäftsregeln

### F010 - Prüfbedarf bei Gästezahländerung

**Status:** Erledigt

**Ziel:** Wenn sich die aktuelle Gästezahl eines Events ändert, sollen betroffene Aufgaben und Budgetbereiche als prüfbedürftig markiert werden. Dadurch werden Auswirkungen auf Planung, Kapazitäten und Kosten sichtbar. Die Regel verhindert, dass relevante Anpassungen nach Gästeänderungen übersehen werden.

### F011 - Versionierte Ablaufpläne

**Status:** Erledigt

**Ziel:** Änderungen an einem Ablaufplan sollen eine neue Version erzeugen. Pro Event darf nur eine Ablaufplan-Version als aktuell markiert sein; die nächste Versionsnummer wird aus der bisher neuesten Version abgeleitet. So bleibt nachvollziehbar, welche Ablaufversion gültig ist und wie sich der Plan historisch verändert hat.

### F012 - Verbindliche Kommunikation

**Status:** Erledigt

**Ziel:** Nur Kommunikation mit `ist_verbindlich = true` soll als verbindliche Grundlage gelten. Das System muss verbindliche Absprachen klar von unverbindlichen Kontakten unterscheiden. Dadurch lassen sich Entscheidungen und Zusagen später fachlich belastbar nachvollziehen.

### F013 - Aufgabenabhängigkeiten

**Status:** Erledigt

**Ziel:** Eine abhängige Aufgabe darf erst erledigt werden, wenn ihre Vorgänger-Aufgabe erledigt ist. Vorgänger-Aufgaben müssen zum selben Event gehören, damit keine eventübergreifenden Projektpläne entstehen. Das System soll blockierte Aufgaben erkennbar machen und unzulässige Statuswechsel verhindern. Damit werden Abhängigkeiten im Event-Projektplan wirksam abgesichert.

### F014 - Dienstleister-Ausfalleskalation

**Status:** Erledigt

**Ziel:** Wenn ein kritischer Dienstleister ausfällt, sollen betroffene Ablaufpunkte und Aufgaben sichtbar eskaliert werden. Die Eskalation soll zeigen, welche Teile des Events direkt betroffen sind. Dadurch kann schneller auf Ausfälle reagiert und ein Backup organisiert werden.

## Phase 3 - Komfort

### F015 - Dienstleister-Änderungseinreichung

**Status:** Fachlich entschieden

**Ziel:** Es soll fachlich geklärt werden, ob Dienstleister Änderungen selbst einreichen dürfen. Falls ja, braucht das System einen kontrollierten Weg für externe Änderungsvorschläge. Die Umsetzung muss verhindern, dass externe Eingaben ungeprüft verbindliche Planungsdaten überschreiben. Im aktuellen Solo-Scope reichen Dienstleister Änderungen extern ein; ein Systemzugang ist bewusst nicht umgesetzt.

### F016 - Rollen und Kundenansicht

**Status:** Fachlich entschieden

**Ziel:** Es soll geklärt werden, ob Rollen wie Assistenz, Eventmanagerin oder Kundenansicht benötigt werden. Daraus ergeben sich unterschiedliche Rechte, Sichten und Workflows. Das System bleibt im aktuellen Solo-Scope eine interne Einzelansicht; Rollen und Kundenansicht benötigen zuerst Authentifizierung, Rechtekonzept und Freigaberegeln.

### F017 - Wartelisten-Management

**Status:** Erledigt

**Ziel:** Das Wartelisten-Management für Gäste muss fachlich konkretisiert und umgesetzt werden. Es soll regeln, wie Gäste auf die Warteliste kommen, wann sie nachrücken und wie ihr Status sichtbar wird. Diese Funktion erweitert die Gästeverwaltung um einen kontrollierten Kapazitätsworkflow.

### F018 - Tool-Ersetzung und Integration

**Status:** Fachlich entschieden

**Ziel:** Es soll geklärt werden, welche bestehenden Tools ersetzt und welche nur ergänzt werden. Daraus können Import-, Export- oder Integrationsanforderungen entstehen. Mangels konkreter Tool-Liste ergänzt das System bestehende Arbeitsabläufe zunächst als lokale Planungszentrale; Integrationen bleiben bewusst außerhalb des aktuellen Scopes.

### F019 - Konfigurierbare Eskalationen

**Status:** Erledigt

**Ziel:** Eskalationssituationen sollen später konfigurierbar werden, statt fest verdrahtet zu sein. Dazu gehören Regeln für kritische Dienstleister, betroffene Aufgaben und Ablaufpunkte. Diese Funktion macht die Eskalationslogik flexibler für unterschiedliche Event-Typen.
