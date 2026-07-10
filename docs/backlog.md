# backlog.md - Event Management System

_Stand: 2026-07-10_

Stabile Feature-IDs aus `docs/spec.md`. Nicht umnummerieren.

## Phasen

- Phase 1 = Kern: Minimal Viable Product.
- Phase 2 = Geschaeftsregeln.
- Phase 3 = Komfort.

## Phase 1 - Kern

### F001 - Event-Zentrale

**Status:** Erledigt

**Ziel:** Das System braucht ein zentrales Event-Objekt als Einstieg in alle weiteren Arbeitsbereiche. Ein Event haelt Name, Datum, Status, geplante und aktuelle Gaestezahl, Gesamtbudget, Notizen und Erstellzeitpunkt fest. Darauf beziehen sich Ablauf, Aufgaben, Kommunikation, Budget und Dienstleister.

### F002 - Gaesteverwaltung

**Status:** Erledigt

**Ziel:** Gaeste sollen einem Event zugeordnet und mit Kontaktdaten, Typ, Anmeldestatus und relevanten Anforderungen gepflegt werden. Dazu gehoeren Ernaehrung, Allergien, Tischzuweisung und VIP-Anforderungen. Die Funktion bildet die Grundlage fuer Gaestezahlen, Planung und spaetere Wartelistenlogik.

### F003 - Dienstleisterverwaltung

**Status:** Offen

**Ziel:** Externe Anbieter sollen mit Kategorie, Ansprechpartner, Kontaktinformationen und Zuverlaessigkeitsnotiz verwaltet werden. Dienstleister koennen Events zugeordnet werden und optional einen Backup-Dienstleister referenzieren. Damit entsteht die Grundlage fuer Ausfall- und Eskalationslogik.

### F004 - Ablaufplanung

**Status:** Offen

**Ziel:** Fuer jedes Event soll ein Ablaufplan mit einzelnen Programmpunkten gepflegt werden. Ablaufpunkte enthalten Start- und Endzeit, Bezeichnung, Verantwortliche, Pufferkennzeichen und Sichtbarkeit fuer Dienstleister. Die Funktion macht den operativen Event-Ablauf planbar und nachvollziehbar.

### F005 - Aufgabensteuerung

**Status:** Offen

**Ziel:** Aufgaben sollen pro Event mit Faelligkeit, Status, Zuweisung und Erinnerung gepflegt werden. Optional kann eine Aufgabe von einer anderen Aufgabe abhaengen. Damit wird sichtbar, was bis wann erledigt werden muss und welche Arbeit blockiert ist.

### F006 - Kommunikationsprotokoll

**Status:** Offen

**Ziel:** Kommunikationsvorgaenge zu einem Event sollen protokolliert werden. Erfasst werden Kanal, Datum, Inhalt, Beteiligte, Ersteller und ob die Kommunikation verbindlich ist. So bleiben Absprachen nachvollziehbar und koennen spaeter von unverbindlichen Notizen getrennt werden.

### F007 - Budgetuebersicht

**Status:** Offen

**Ziel:** Kosten sollen pro Event als Budget-Positionen geplant und nachverfolgt werden. Je Position werden Angebotsbetrag, bestaetigter Betrag, bezahlter Betrag und optionaler Dienstleisterbezug gespeichert. Dadurch wird sichtbar, welche Kosten geplant, bestaetigt und bereits bezahlt sind.

### F008 - Event-Dienstleister-Zuordnung

**Status:** Offen

**Ziel:** Events und Dienstleister sollen ueber eine n:m-Zuordnung verbunden werden. Pro Zuordnung werden Status, Vertrags-URL und Stornofrist dokumentiert. Diese Verbindung bildet die Grundlage fuer Dienstleisterplanung, Vertragsuebersicht und spaetere Ausfallbehandlung.

### F009 - Lokale SQLite-Persistenz

**Status:** Offen

**Ziel:** Das Backend muss SQLite als lokale Datenbank verwenden. Das Datenmodell soll die fachlichen Kernobjekte aus der Spec relational abbilden. Damit entsteht eine belastbare Grundlage fuer ein minimal lauffaehiges System.

## Phase 2 - Geschaeftsregeln

### F010 - Pruefbedarf bei Gaestezahlsaenderung

**Status:** Offen

**Ziel:** Wenn sich die aktuelle Gaestezahl eines Events aendert, sollen betroffene Aufgaben und Budgetbereiche als pruefbeduerftig markiert werden. Dadurch werden Auswirkungen auf Planung, Kapazitaeten und Kosten sichtbar. Die Regel verhindert, dass relevante Anpassungen nach Gaesteaenderungen uebersehen werden.

### F011 - Versionierte Ablaufplaene

**Status:** Offen

**Ziel:** Aenderungen an einem Ablaufplan sollen eine neue Version erzeugen. Pro Event darf nur eine Ablaufplan-Version als aktuell markiert sein. So bleibt nachvollziehbar, welche Ablaufversion gueltig ist und wie sich der Plan historisch veraendert hat.

### F012 - Verbindliche Kommunikation

**Status:** Offen

**Ziel:** Nur Kommunikation mit `ist_verbindlich = true` soll als verbindliche Grundlage gelten. Das System muss verbindliche Absprachen klar von unverbindlichen Kontakten unterscheiden. Dadurch lassen sich Entscheidungen und Zusagen spaeter fachlich belastbar nachvollziehen.

### F013 - Aufgabenabhaengigkeiten

**Status:** Offen

**Ziel:** Eine abhaengige Aufgabe darf erst erledigt werden, wenn ihre Vorgaenger-Aufgabe erledigt ist. Das System soll blockierte Aufgaben erkennbar machen und unzulaessige Statuswechsel verhindern. Damit werden Abhaengigkeiten im Event-Projektplan wirksam abgesichert.

### F014 - Dienstleister-Ausfalleskalation

**Status:** Offen

**Ziel:** Wenn ein kritischer Dienstleister ausfaellt, sollen betroffene Ablaufpunkte und Aufgaben sichtbar eskaliert werden. Die Eskalation soll zeigen, welche Teile des Events direkt betroffen sind. Dadurch kann schneller auf Ausfaelle reagiert und ein Backup organisiert werden.

## Phase 3 - Komfort

### F015 - Dienstleister-Aenderungseinreichung

**Status:** Offen

**Ziel:** Es soll fachlich geklaert werden, ob Dienstleister Aenderungen selbst einreichen duerfen. Falls ja, braucht das System einen kontrollierten Weg fuer externe Aenderungsvorschlaege. Die Umsetzung muss verhindern, dass externe Eingaben ungeprueft verbindliche Planungsdaten ueberschreiben.

### F016 - Rollen und Kundenansicht

**Status:** Offen

**Ziel:** Es soll geklaert werden, ob Rollen wie Assistenz, Eventmanagerin oder Kundenansicht benoetigt werden. Daraus ergeben sich unterschiedliche Rechte, Sichten und Workflows. Diese Funktion erweitert das System von einer Einzelansicht zu rollenbasiertem Arbeiten.

### F017 - Wartelisten-Management

**Status:** Offen

**Ziel:** Das Wartelisten-Management fuer Gaeste muss fachlich konkretisiert und umgesetzt werden. Es soll regeln, wie Gaeste auf die Warteliste kommen, wann sie nachruecken und wie ihr Status sichtbar wird. Diese Funktion erweitert die Gaesteverwaltung um einen kontrollierten Kapazitaetsworkflow.

### F018 - Tool-Ersetzung und Integration

**Status:** Offen

**Ziel:** Es soll geklaert werden, welche bestehenden Tools ersetzt und welche nur ergaenzt werden. Daraus koennen Import-, Export- oder Integrationsanforderungen entstehen. Die Funktion dient dazu, das System sauber in bestehende Arbeitsablaeufe einzupassen.

### F019 - Konfigurierbare Eskalationen

**Status:** Offen

**Ziel:** Eskalationssituationen sollen spaeter konfigurierbar werden, statt fest verdrahtet zu sein. Dazu gehoeren Regeln fuer kritische Dienstleister, betroffene Aufgaben und Ablaufpunkte. Diese Funktion macht die Eskalationslogik flexibler fuer unterschiedliche Event-Typen.
