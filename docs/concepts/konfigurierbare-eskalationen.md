# Konfigurierbare Eskalationen

_Stand: 2026-07-15_

## Entscheidung

Eskalationsregeln liegen zentral in `src/lib/escalation-config.ts`. Der aktuelle Scope konfiguriert Dienstleister-Ausfaelle ueber einen kritischen Status und Zielbereiche.

## Aktuelle Regel

- Ausloeser: kritische Event-Dienstleister-Zuordnung mit Status `ausgefallen`.
- Zielbereiche: Aufgaben und Ablaufpunkte des aktuellen Ablaufplans.
- Wirkung: Zielbereiche werden als `eskaliert` markiert.

## Begruendung

- Die Regel ist nicht mehr ueber mehrere Server Actions verstreut.
- Zielbereiche koennen spaeter an einer Stelle angepasst werden.
- Das Datenmodell muss fuer diesen Schritt nicht erweitert werden.

## Nicht enthalten

- UI zur Bearbeitung der Eskalationsregeln.
- Mandanten- oder Eventtyp-spezifische Regeln.
- Priorisierung mehrerer Eskalationsregeln.
