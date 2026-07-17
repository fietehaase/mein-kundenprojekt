# Kalibrierung: Wie gut kenne ich die App?

Prüfe jede Aussage direkt am Code, am Datenmodell oder in der laufenden App.

1. **Business Rule:** Ein Gast mit gewünschtem Status `angemeldet` oder `bestaetigt` wird automatisch auf `warteliste` gesetzt, wenn die geplante Gästezahl des Events bereits erreicht ist. Prüfstelle: `src/lib/waitlist.ts` und die Server Action `createGuest` in `src/app/page.tsx`.

2. **Business Rule:** Eine Aufgabe darf nicht auf `erledigt` gesetzt werden, solange ihre Vorgänger-Aufgabe noch nicht erledigt ist. Prüfstelle: `src/lib/task-dependency.ts` und die Server Action `updateTaskStatus` in `src/app/page.tsx`.

3. **Datenmodell mit einer n:m-Beziehung:** Events und Dienstleister sind über das Prisma-Modell `EventDienstleister` als n:m-Beziehung verbunden; der zusammengesetzte Primärschlüssel besteht aus `eventId` und `dienstleisterId`. Prüfstelle: `prisma/schema.prisma`.

4. **Widerspruchsauflösung:** Die Spec enthält offene Punkte zu Rollen, Kundenansicht und Dienstleister-Änderungseinreichung; der aktuelle Backlog löst diese Punkte bewusst als `Fachlich entschieden` statt als implementierte Rollen- oder Portal-Funktion. Prüfstelle: `docs/spec.md`, `docs/backlog.md` und `docs/concepts/rollen-und-kundenansicht.md`.

5. **Freie relevante Aussage:** Das Dashboard enthält eine regelbasierte Smart-Assistenz, die aus vorhandenen Event-Daten priorisierte Hinweise mit Grund und nächstem Schritt erzeugt. Prüfstelle: `src/lib/event-insights.ts`, `src/lib/event-insights.test.ts` und `SmartInsights` in `src/app/page.tsx`.
