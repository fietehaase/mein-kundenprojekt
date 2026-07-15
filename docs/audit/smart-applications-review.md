# Smart-Applications-Review

_Stand: 2026-07-16_

## Ziel

Dieses Audit dokumentiert die wichtigsten Bewertungspunkte aus Sicht des Moduls Smart Applications und welche Maßnahmen im Projekt umgesetzt wurden.

## Umgesetzte Maßnahmen

- Smart-Assistenz im Dashboard ergänzt: Die App berechnet priorisierte Hinweise aus Eskalationen, blockierten oder überfälligen Aufgaben, Prüfbedarf, Budgetüberschreitungen, Kapazitätsproblemen und fehlender verbindlicher Kommunikation.
- Die Priorisierung ist erklärbar: Jeder Hinweis nennt Event, Priorität, Grund und nächsten sinnvollen Schritt.
- Die Berechnung liegt in `src/lib/event-insights.ts` und ist über Unit-Tests abgesichert.
- Der Backlog trennt jetzt zwischen vollständig implementierten Features und fachlich entschiedenen Nicht-Scope-Themen.
- Die Konzeptdokumente halten bewusst nicht umgesetzte Rollen-, Dienstleister- und Integrationsszenarien fest.

## Verbleibende bewusste Grenzen

- Es gibt weiterhin kein Authentifizierungs- oder Rollenmodell, weil das Projekt als internes Solo-Werkzeug definiert ist.
- Externe Dienstleisterzugänge und Kundenansichten sind nicht implementiert.
- Tool-Integrationen, Importe und Exporte bleiben ohne konkrete Quellsysteme außerhalb des aktuellen Scopes.
- Die zentrale Seite ist weiterhin groß; die wichtigsten Smart-Regeln sind aber aus der UI herausgelöst und getestet.

## Bewertungshinweis

Der Smart-Anteil ist nun als regelbasierte Assistenz sichtbar. Die App trifft keine automatischen irreversiblen Entscheidungen, sondern priorisiert Risiken und erklärt die Ableitung für die Nutzer.
