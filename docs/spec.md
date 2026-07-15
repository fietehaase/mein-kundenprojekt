# Spec: Event Management System

Status: Draft v1  
Quelle: Kundeninterview, Meeting 1 abgeschlossen, Meeting 2 ausstehend  
Backend-Vorgabe: SQLite ist verpflichtend.

## Ziel

Das System unterstützt die Planung und Steuerung von Events. Es soll
Abhängigkeiten, Dienstleister-Ausfälle, Ablaufplan-Versionen, verbindliche
Kommunikation und Budgetinformationen nachvollziehbar machen.

## Entitäten

### Event

Kernobjekt für eine Veranstaltung.

Wichtige Attribute: `id`, `name`, `datum`, `status`,
`gaesteanzahl_geplant`, `gaesteanzahl_aktuell`, `budget_gesamt`,
`notizen`, `erstellt_am`.

Statuswerte: `geplant`, `laufend`, `abgeschlossen`, `storniert`.

### Gast

Person, die einem Event zugeordnet werden kann.

Wichtige Attribute: `id`, `name`, `email`, `telefon`, `typ`,
`anmeldestatus`, `ernaehrung`, `allergien`, `tischzuweisung`,
`vip_anforderungen`.

Typen: `standard`, `vip`, `speaker`, `dienstleister_gast`.

Anmeldestatus: `angemeldet`, `abgesagt`, `warteliste`, `bestaetigt`.

### Dienstleister

Externer Anbieter für ein Event.

Wichtige Attribute: `id`, `name`, `kategorie`, `ansprechpartner`,
`telefon_mobil`, `email`, `zuverlaessigkeits_notiz`, `backup_fuer`.

Kategorien: `catering`, `technik`, `location`, `dekoration`,
`moderation`, `security`, `sonstige`.

### Ablaufplan

Versionierter Ablauf für ein Event.

Wichtige Attribute: `id`, `event_id`, `version`, `ist_aktuell`,
`erstellt_am`.

### Ablaufpunkt

Ein einzelner Programmpunkt innerhalb eines Ablaufplans.

Wichtige Attribute: `id`, `ablaufplan_id`, `uhrzeit_start`,
`uhrzeit_ende`, `bezeichnung`, `verantwortlich`, `ist_puffer`,
`sichtbar_fuer_dienstleister`.

### Aufgabe

To-do mit Fälligkeit und optionaler Abhängigkeit.

Wichtige Attribute: `id`, `event_id`, `bezeichnung`, `faellig_am`,
`status`, `abhaengig_von`, `zugewiesen_an`, `erinnerung_am`.

Statuswerte: `offen`, `erledigt`, `ueberfaellig`.

### Kommunikation

Protokollierter Kommunikationsvorgang zu einem Event.

Wichtige Attribute: `id`, `event_id`, `kanal`, `datum`, `inhalt`,
`ist_verbindlich`, `beteiligte`, `erstellt_von`.

Kanäle: `email`, `whatsapp`, `telefon`, `vor_ort`.

### Budget-Position

Budgeteintrag für Kostenplanung und Zahlungsstand.

Wichtige Attribute: `id`, `event_id`, `bezeichnung`, `betrag_angebot`,
`betrag_bestaetigt`, `betrag_bezahlt`, `dienstleister_id`.

### Event_Dienstleister

Verbindungstabelle für die n:m-Beziehung zwischen Events und
Dienstleistern.

Mindestfelder: `event_id`, `dienstleister_id`, `status`, `vertrags_url`,
`stornofrist`.

## Beziehungen

- Ein Event hat einen oder mehrere Ablaufpläne.
- Ein Ablaufplan hat mehrere Ablaufpunkte.
- Ein Event hat mehrere Aufgaben.
- Eine Aufgabe kann von einer anderen Aufgabe abhängen.
- Ein Event hat mehrere Budget-Positionen.
- Eine Budget-Position kann einem Dienstleister zugeordnet sein.
- Ein Event kann mehrere Kommunikations-Einträge haben.
- Ein Dienstleister kann einen Backup-Dienstleister referenzieren.
- Events und Dienstleister stehen in einer n:m-Beziehung über
  `Event_Dienstleister`.

## Geschäftsregeln

- Wenn sich die Gästeanzahl ändert, werden betroffene Aufgaben und
  Budgetbereiche als prüfbedürftig markiert.
- Änderungen an einem Ablaufplan erzeugen eine neue Version; nur eine
  Version ist aktuell.
- Nur Kommunikation mit `ist_verbindlich = true` gilt als verbindliche
  Grundlage.
- Eine abhängige Aufgabe darf erst erledigt werden, wenn ihre
  Vorgänger-Aufgabe erledigt ist.
- Fällt ein kritischer Dienstleister aus, werden betroffene Ablaufpunkte
  und Aufgaben sichtbar eskaliert.

## Offene fachliche Punkte

- Dürfen Dienstleister Änderungen selbst einreichen?
- Soll es Rollen wie Assistenz, Eventmanagerin oder Kundenansicht geben?
- Wie genau funktioniert Wartelisten-Management?
- Welche bestehenden Tools werden ersetzt oder nur ergänzt?
- Welche Eskalationssituationen sollen konfigurierbar sein?
