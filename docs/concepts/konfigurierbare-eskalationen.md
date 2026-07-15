# Konfigurierbare Eskalationen

_Stand: 2026-07-15_

## Entscheidung

Eskalationsregeln liegen zentral in `src/lib/escalation-config.ts`. Der aktuelle Scope konfiguriert Dienstleister-Ausfälle über einen kritischen Status und Zielbereiche.

## Aktuelle Regel

- Auslöser: kritische Event-Dienstleister-Zuordnung mit Status `ausgefallen`.
- Zielbereiche: Aufgaben und Ablaufpunkte des aktuellen Ablaufplans.
- Wirkung: Zielbereiche werden als `eskaliert` markiert.

## Begründung

- Die Regel ist nicht mehr über mehrere Server Actions verstreut.
- Zielbereiche können später an einer Stelle angepasst werden.
- Das Datenmodell muss für diesen Schritt nicht erweitert werden.

## Nicht enthalten

- UI zur Bearbeitung der Eskalationsregeln.
- Mandanten- oder Eventtyp-spezifische Regeln.
- Priorisierung mehrerer Eskalationsregeln.
