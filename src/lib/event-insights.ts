export type InsightPriority = "hoch" | "mittel" | "niedrig";

export type EventInsightInput = {
  name: string;
  datum: Date;
  gaesteanzahlGeplant: number;
  budgetGesamt: number;
  budgetPruefbeduerftig: boolean;
  gaeste: Array<{ anmeldestatus: string }>;
  aufgaben: Array<{
    status: string;
    pruefbeduerftig: boolean;
    eskaliert: boolean;
    abhaengigVon?: { status: string } | null;
  }>;
  budgetPositionen: Array<{
    betragBestaetigt?: number | null;
    pruefbeduerftig: boolean;
  }>;
  aktuelleAblaufpunkte: Array<{ eskaliert: boolean }>;
  verbindlicheKommunikation: number;
};

export type EventInsight = {
  eventName: string;
  priority: InsightPriority;
  score: number;
  title: string;
  reason: string;
  nextStep: string;
};

export function buildEventInsights(
  events: EventInsightInput[],
  now = new Date(),
) {
  return events
    .flatMap((event) => buildInsightsForEvent(event, now))
    .sort(
      (left, right) =>
        right.score - left.score || left.title.localeCompare(right.title),
    );
}

function buildInsightsForEvent(event: EventInsightInput, now: Date) {
  const insights: EventInsight[] = [];
  const activeGuests = event.gaeste.filter((guest) =>
    isActiveGuestStatus(guest.anmeldestatus),
  ).length;
  const confirmedBudget = event.budgetPositionen.reduce(
    (sum, position) => sum + Number(position.betragBestaetigt ?? 0),
    0,
  );
  const reviewItems =
    Number(event.budgetPruefbeduerftig) +
    event.aufgaben.filter((task) => task.pruefbeduerftig).length +
    event.budgetPositionen.filter((position) => position.pruefbeduerftig).length;
  const escalations =
    event.aufgaben.filter((task) => task.eskaliert).length +
    event.aktuelleAblaufpunkte.filter((item) => item.eskaliert).length;
  const blockedTasks = event.aufgaben.filter(
    (task) => task.abhaengigVon && task.abhaengigVon.status !== "erledigt",
  ).length;
  const overdueTasks = event.aufgaben.filter(
    (task) => task.status === "ueberfaellig",
  ).length;
  const daysUntilEvent = Math.ceil(
    (event.datum.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (escalations > 0) {
    insights.push({
      eventName: event.name,
      priority: "hoch",
      score: 100 + escalations,
      title: "Dienstleister-Ausfall prüfen",
      reason: `${escalations} betroffene Aufgaben oder Ablaufpunkte sind eskaliert.`,
      nextStep: "Backup-Dienstleister und kritische Programmpunkte sofort prüfen.",
    });
  }

  if (overdueTasks > 0 || blockedTasks > 0) {
    insights.push({
      eventName: event.name,
      priority: overdueTasks > 0 ? "hoch" : "mittel",
      score: 80 + overdueTasks * 2 + blockedTasks,
      title: "Aufgabenplan bereinigen",
      reason: `${overdueTasks} Aufgaben sind überfällig, ${blockedTasks} Aufgaben sind blockiert.`,
      nextStep: "Vorgänger-Aufgaben abschließen oder Status und Zuständigkeit aktualisieren.",
    });
  }

  if (reviewItems > 0) {
    insights.push({
      eventName: event.name,
      priority: "mittel",
      score: 60 + reviewItems,
      title: "Planungsänderung nacharbeiten",
      reason: `${reviewItems} Bereiche sind als prüfbedürftig markiert.`,
      nextStep: "Budgetpositionen und Aufgaben nach Gästezahl- oder Planänderungen prüfen.",
    });
  }

  if (confirmedBudget > event.budgetGesamt) {
    insights.push({
      eventName: event.name,
      priority: "hoch",
      score: 90,
      title: "Budget überschritten",
      reason: `Bestätigte Kosten liegen über dem geplanten Gesamtbudget.`,
      nextStep: "Budgetfreigabe einholen oder Kostenpositionen neu verhandeln.",
    });
  }

  if (activeGuests > event.gaesteanzahlGeplant) {
    insights.push({
      eventName: event.name,
      priority: "mittel",
      score: 55,
      title: "Kapazität prüfen",
      reason: "Die aktive Gästezahl liegt über der geplanten Kapazität.",
      nextStep: "Warteliste, Location-Kapazität und Catering-Mengen abgleichen.",
    });
  }

  if (daysUntilEvent <= 14 && event.verbindlicheKommunikation === 0) {
    insights.push({
      eventName: event.name,
      priority: "mittel",
      score: 50 - Math.max(daysUntilEvent, 0),
      title: "Verbindliche Zusagen fehlen",
      reason: "Kurz vor dem Event ist keine verbindliche Kommunikation dokumentiert.",
      nextStep: "Zentrale Zusagen als verbindliche Kommunikation erfassen.",
    });
  }

  return insights;
}
import { isActiveGuestStatus } from "./waitlist";
