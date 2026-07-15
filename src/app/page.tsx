import { revalidatePath } from "next/cache";
import styles from "./page.module.css";
import { ConfirmSubmitButton } from "./confirm-submit-button";
import { prisma } from "@/lib/prisma";
import {
  EVENT_STATUSES,
  parseEventInput,
  parseEventStatus,
} from "@/lib/event-input";
import {
  GUEST_STATUSES,
  GUEST_TYPES,
  parseGuestInput,
  parseGuestStatus,
  parseId,
} from "@/lib/guest-input";
import {
  PROVIDER_CATEGORIES,
  isValidProviderBackupScope,
  parseProviderInput,
} from "@/lib/provider-input";
import {
  parseScheduleItemInput,
  parseSchedulePlanInput,
} from "@/lib/schedule-input";
import {
  nextScheduleVersion,
  shouldCreateInitialCurrentSchedule,
} from "@/lib/schedule-versioning";
import {
  TASK_STATUSES,
  parseTaskInput,
  parseTaskStatus,
} from "@/lib/task-input";
import {
  COMMUNICATION_CHANNELS,
  parseCommunicationInput,
} from "@/lib/communication-input";
import { filterBindingCommunications } from "@/lib/communication-binding";
import { parseBudgetInput } from "@/lib/budget-input";
import {
  EVENT_PROVIDER_STATUSES,
  parseEventProviderInput,
} from "@/lib/event-provider-input";
import { hasGuestCountChanged } from "@/lib/guest-impact";
import {
  canCompleteTask,
  isTaskBlockedByDependency,
  isTaskDependencyInSameEvent,
} from "@/lib/task-dependency";
import { triggersProviderOutageEscalation } from "@/lib/provider-escalation";
import { ESCALATION_CONFIG } from "@/lib/escalation-config";
import {
  buildEventInsights,
  type EventInsight,
  type EventInsightInput,
} from "@/lib/event-insights";
import {
  ACTIVE_GUEST_STATUSES,
  isActiveGuestStatus,
  resolveGuestStatusForCapacity,
} from "@/lib/waitlist";
import {
  formatCommunicationChannel,
  formatCurrency,
  formatDate,
  formatDateInput,
  formatDateTime,
  formatEventProviderStatus,
  formatGuestStatus,
  formatGuestType,
  formatOptionalCurrency,
  formatProviderCategory,
  formatStatus,
  formatTaskStatus,
  formatTimeRange,
} from "@/lib/formatters";

export const dynamic = "force-dynamic";

type EventListItem = Awaited<ReturnType<typeof getEvents>>[number];
type ProviderListItem = Awaited<ReturnType<typeof getProviders>>[number];

const EVENT_YEAR_OPTIONS = Array.from({ length: 8 }, (_, index) =>
  (new Date().getFullYear() + index).toString(),
);
const EVENT_MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  (index + 1).toString().padStart(2, "0"),
);
const EVENT_DAY_OPTIONS = Array.from({ length: 31 }, (_, index) =>
  (index + 1).toString().padStart(2, "0"),
);

async function getEvents() {
  return prisma.event.findMany({
    include: {
      gaeste: {
        orderBy: [{ name: "asc" }],
      },
      ablaufplaene: {
        include: {
          ablaufpunkte: {
            orderBy: [{ uhrzeitStart: "asc" }],
          },
        },
        orderBy: [{ version: "desc" }],
      },
      aufgaben: {
        include: {
          abhaengigVon: true,
          blockiert: true,
        },
        orderBy: [{ faelligAm: "asc" }, { id: "asc" }],
      },
      kommunikationen: {
        orderBy: [{ datum: "desc" }, { id: "desc" }],
      },
      budgetPositionen: {
        include: {
          dienstleister: true,
        },
        orderBy: [{ bezeichnung: "asc" }, { id: "asc" }],
      },
      eventDienstleister: {
        include: {
          dienstleister: true,
        },
        orderBy: [{ dienstleisterId: "asc" }],
      },
    },
    orderBy: [{ datum: "asc" }, { erstelltAm: "desc" }],
  });
}

async function getProviders() {
  return prisma.dienstleister.findMany({
    orderBy: [{ kategorie: "asc" }, { name: "asc" }],
  });
}

async function createEvent(formData: FormData) {
  "use server";

  const input = parseEventInput({
    name: String(formData.get("name") ?? ""),
    datum: readDateInput(formData, "datum"),
    status: String(formData.get("status") ?? "geplant"),
    gaesteanzahlGeplant: String(formData.get("gaesteanzahlGeplant") ?? "0"),
    gaesteanzahlAktuell: String(formData.get("gaesteanzahlAktuell") ?? "0"),
    budgetGesamt: String(formData.get("budgetGesamt") ?? "0"),
    notizen: String(formData.get("notizen") ?? ""),
  });

  await prisma.event.create({
    data: input,
  });

  revalidatePath("/");
}

function readDateInput(formData: FormData, field: string) {
  const directDate = String(formData.get(field) ?? "");

  if (directDate) {
    return directDate;
  }

  const year = String(formData.get(`${field}Jahr`) ?? "");
  const month = String(formData.get(`${field}Monat`) ?? "");
  const day = String(formData.get(`${field}Tag`) ?? "");

  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

async function updateEventStatus(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Event-ID");
  const status = parseEventStatus(String(formData.get("status") ?? ""));

  await prisma.event.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/");
}

async function deleteEvent(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Event-ID");

  await prisma.event.delete({
    where: { id },
  });

  revalidatePath("/");
}

async function createGuest(formData: FormData) {
  "use server";

  const input = parseGuestInput({
    eventId: String(formData.get("eventId") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    telefon: String(formData.get("telefon") ?? ""),
    typ: String(formData.get("typ") ?? "standard"),
    anmeldestatus: String(formData.get("anmeldestatus") ?? "angemeldet"),
    ernaehrung: String(formData.get("ernaehrung") ?? ""),
    allergien: String(formData.get("allergien") ?? ""),
    tischzuweisung: String(formData.get("tischzuweisung") ?? ""),
    vipAnforderungen: String(formData.get("vipAnforderungen") ?? ""),
  });

  const [event, activeGuests] = await Promise.all([
    prisma.event.findUnique({
      where: { id: input.eventId },
      select: { gaesteanzahlGeplant: true },
    }),
    countActiveGuestsForEvent(input.eventId),
  ]);

  if (!event) {
    throw new Error("Das Event wurde nicht gefunden. Bitte lade die Seite neu.");
  }

  await prisma.gast.create({
    data: {
      ...input,
      anmeldestatus: resolveGuestStatusForCapacity(
        input.anmeldestatus,
        event.gaesteanzahlGeplant,
        activeGuests,
      ),
    },
  });
  await reconcileEventGuestCapacity(input.eventId);

  revalidatePath("/");
}

async function updateGuestStatus(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Gast-ID");
  const eventId = parseId(String(formData.get("eventId") ?? ""), "Event-ID");
  const anmeldestatus = parseGuestStatus(
    String(formData.get("anmeldestatus") ?? ""),
  );

  const [event, guest, activeGuests] = await Promise.all([
    prisma.event.findUnique({
      where: { id: eventId },
      select: { gaesteanzahlGeplant: true },
    }),
    prisma.gast.findUnique({
      where: { id },
      select: { anmeldestatus: true, eventId: true },
    }),
    countActiveGuestsForEvent(eventId),
  ]);

  if (!event || !guest) {
    throw new Error(
      "Event oder Gast wurde nicht gefunden. Bitte lade die Seite neu.",
    );
  }

  if (guest.eventId !== eventId) {
    throw new Error("Der Gast gehört nicht zu diesem Event.");
  }

  const activeGuestsWithoutGuest = isActiveGuestStatus(guest.anmeldestatus)
    ? activeGuests - 1
    : activeGuests;

  await prisma.gast.update({
    where: { id },
    data: {
      anmeldestatus: resolveGuestStatusForCapacity(
        anmeldestatus,
        event.gaesteanzahlGeplant,
        activeGuestsWithoutGuest,
      ),
    },
  });
  await reconcileEventGuestCapacity(eventId);

  revalidatePath("/");
}

async function deleteGuest(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Gast-ID");
  const eventId = parseId(String(formData.get("eventId") ?? ""), "Event-ID");
  const guest = await prisma.gast.findUnique({
    where: { id },
    select: { eventId: true },
  });

  if (!guest) {
    throw new Error("Der Gast wurde nicht gefunden. Bitte lade die Seite neu.");
  }

  if (guest.eventId !== eventId) {
    throw new Error("Der Gast gehört nicht zu diesem Event.");
  }

  await prisma.gast.delete({
    where: { id },
  });
  await reconcileEventGuestCapacity(eventId);

  revalidatePath("/");
}

async function countActiveGuestsForEvent(eventId: number) {
  return prisma.gast.count({
    where: {
      eventId,
      anmeldestatus: {
        in: ACTIVE_GUEST_STATUSES,
      },
    },
  });
}

async function reconcileEventGuestCapacity(eventId: number) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { gaesteanzahlGeplant: true },
  });

  if (!event) {
    throw new Error("Das Event wurde nicht gefunden. Bitte lade die Seite neu.");
  }

  const activeBeforePromotion = await countActiveGuestsForEvent(eventId);
  const freeSeats = Math.max(
    event.gaesteanzahlGeplant - activeBeforePromotion,
    0,
  );

  if (freeSeats > 0) {
    const waitlistGuests = await prisma.gast.findMany({
      where: {
        eventId,
        anmeldestatus: "warteliste",
      },
      orderBy: [{ id: "asc" }],
      take: freeSeats,
    });

    await Promise.all(
      waitlistGuests.map((guest) =>
        prisma.gast.update({
          where: { id: guest.id },
          data: { anmeldestatus: "bestaetigt" },
        }),
      ),
    );
  }

  await syncEventGuestCount(eventId);
}

async function syncEventGuestCount(eventId: number) {
  const [activeGuests, event] = await Promise.all([
    countActiveGuestsForEvent(eventId),
    prisma.event.findUnique({
      where: { id: eventId },
      select: { gaesteanzahlAktuell: true },
    }),
  ]);

  if (!event) {
    throw new Error("Das Event wurde nicht gefunden. Bitte lade die Seite neu.");
  }

  if (!hasGuestCountChanged(event.gaesteanzahlAktuell, activeGuests)) {
    return;
  }

  await prisma.$transaction([
    prisma.event.update({
      where: { id: eventId },
      data: {
        gaesteanzahlAktuell: activeGuests,
        budgetPruefbeduerftig: true,
      },
    }),
    prisma.aufgabe.updateMany({
      where: { eventId },
      data: { pruefbeduerftig: true },
    }),
    prisma.budgetPosition.updateMany({
      where: { eventId },
      data: { pruefbeduerftig: true },
    }),
  ]);
}

async function createProvider(formData: FormData) {
  "use server";

  const input = parseProviderInput({
    name: String(formData.get("name") ?? ""),
    kategorie: String(formData.get("kategorie") ?? "sonstige"),
    ansprechpartner: String(formData.get("ansprechpartner") ?? ""),
    telefonMobil: String(formData.get("telefonMobil") ?? ""),
    email: String(formData.get("email") ?? ""),
    zuverlaessigkeitsNotiz: String(
      formData.get("zuverlaessigkeitsNotiz") ?? "",
    ),
    backupFuerId: String(formData.get("backupFuerId") ?? ""),
  });

  await prisma.dienstleister.create({
    data: input,
  });

  revalidatePath("/");
}

async function deleteProvider(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Dienstleister-ID");

  await prisma.dienstleister.delete({
    where: { id },
  });

  revalidatePath("/");
}

async function updateProvider(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Dienstleister-ID");
  const input = parseProviderInput({
    name: String(formData.get("name") ?? ""),
    kategorie: String(formData.get("kategorie") ?? "sonstige"),
    ansprechpartner: String(formData.get("ansprechpartner") ?? ""),
    telefonMobil: String(formData.get("telefonMobil") ?? ""),
    email: String(formData.get("email") ?? ""),
    zuverlaessigkeitsNotiz: String(
      formData.get("zuverlaessigkeitsNotiz") ?? "",
    ),
    backupFuerId: String(formData.get("backupFuerId") ?? ""),
  });

  if (!isValidProviderBackupScope({ id, backupFuerId: input.backupFuerId })) {
    throw new Error("Ein Dienstleister kann nicht sein eigener Backup sein.");
  }

  await prisma.dienstleister.update({
    where: { id },
    data: input,
  });

  revalidatePath("/");
}

async function createSchedulePlan(formData: FormData) {
  "use server";

  const input = parseSchedulePlanInput({
    eventId: String(formData.get("eventId") ?? ""),
  });
  const [existingCurrentPlan, latestPlan] = await Promise.all([
    prisma.ablaufplan.findFirst({
      where: {
        eventId: input.eventId,
        istAktuell: true,
      },
    }),
    prisma.ablaufplan.findFirst({
      where: {
        eventId: input.eventId,
      },
      orderBy: [{ version: "desc" }],
    }),
  ]);

  if (shouldCreateInitialCurrentSchedule(Boolean(existingCurrentPlan))) {
    await prisma.ablaufplan.create({
      data: {
        eventId: input.eventId,
        version: nextScheduleVersion(latestPlan?.version ?? null),
        istAktuell: true,
      },
    });
  }

  revalidatePath("/");
}

async function createScheduleItem(formData: FormData) {
  "use server";

  const input = parseScheduleItemInput({
    ablaufplanId: String(formData.get("ablaufplanId") ?? ""),
    uhrzeitStart: String(formData.get("uhrzeitStart") ?? ""),
    uhrzeitEnde: String(formData.get("uhrzeitEnde") ?? ""),
    bezeichnung: String(formData.get("bezeichnung") ?? ""),
    verantwortlich: String(formData.get("verantwortlich") ?? ""),
    istPuffer: formData.get("istPuffer") ? "on" : null,
    sichtbarFuerDienstleister: formData.get("sichtbarFuerDienstleister")
      ? "on"
      : null,
  });
  const currentPlan = await prisma.ablaufplan.findUnique({
    where: { id: input.ablaufplanId },
    include: {
      ablaufpunkte: {
        orderBy: [{ uhrzeitStart: "asc" }],
      },
    },
  });

  if (!currentPlan || !currentPlan.istAktuell) {
    throw new Error(
      "Nur der aktuelle Ablaufplan kann geändert werden. Bitte lade die Seite neu.",
    );
  }

  await prisma.$transaction([
    prisma.ablaufplan.update({
      where: { id: currentPlan.id },
      data: { istAktuell: false },
    }),
    prisma.ablaufplan.create({
      data: {
        eventId: currentPlan.eventId,
        version: nextScheduleVersion(currentPlan.version),
        istAktuell: true,
        ablaufpunkte: {
          create: [
            ...currentPlan.ablaufpunkte.map(copyScheduleItem),
            {
              uhrzeitStart: input.uhrzeitStart,
              uhrzeitEnde: input.uhrzeitEnde,
              bezeichnung: input.bezeichnung,
              verantwortlich: input.verantwortlich,
              istPuffer: input.istPuffer,
              sichtbarFuerDienstleister: input.sichtbarFuerDienstleister,
            },
          ],
        },
      },
    }),
  ]);

  revalidatePath("/");
}

async function deleteScheduleItem(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Ablaufpunkt-ID");
  const item = await prisma.ablaufpunkt.findUnique({
    where: { id },
    include: {
      ablaufplan: {
        include: {
          ablaufpunkte: {
            orderBy: [{ uhrzeitStart: "asc" }],
          },
        },
      },
    },
  });

  if (!item || !item.ablaufplan.istAktuell) {
    throw new Error(
      "Nur aktuelle Ablaufpunkte können gelöscht werden. Bitte lade die Seite neu.",
    );
  }

  await prisma.$transaction([
    prisma.ablaufplan.update({
      where: { id: item.ablaufplanId },
      data: { istAktuell: false },
    }),
    prisma.ablaufplan.create({
      data: {
        eventId: item.ablaufplan.eventId,
        version: nextScheduleVersion(item.ablaufplan.version),
        istAktuell: true,
        ablaufpunkte: {
          create: item.ablaufplan.ablaufpunkte
            .filter((scheduleItem) => scheduleItem.id !== id)
            .map(copyScheduleItem),
        },
      },
    }),
  ]);

  revalidatePath("/");
}

function copyScheduleItem(item: {
  uhrzeitStart: Date;
  uhrzeitEnde: Date | null;
  bezeichnung: string;
  verantwortlich: string | null;
  istPuffer: boolean;
  sichtbarFuerDienstleister: boolean;
}) {
  return {
    uhrzeitStart: item.uhrzeitStart,
    uhrzeitEnde: item.uhrzeitEnde,
    bezeichnung: item.bezeichnung,
    verantwortlich: item.verantwortlich,
    istPuffer: item.istPuffer,
    sichtbarFuerDienstleister: item.sichtbarFuerDienstleister,
  };
}

async function createTask(formData: FormData) {
  "use server";

  const input = parseTaskInput({
    eventId: String(formData.get("eventId") ?? ""),
    bezeichnung: String(formData.get("bezeichnung") ?? ""),
    faelligAm: String(formData.get("faelligAm") ?? ""),
    status: String(formData.get("status") ?? "offen"),
    abhaengigVonId: String(formData.get("abhaengigVonId") ?? ""),
    zugewiesenAn: String(formData.get("zugewiesenAn") ?? ""),
    erinnerungAm: String(formData.get("erinnerungAm") ?? ""),
  });

  if (input.abhaengigVonId) {
    const predecessor = await prisma.aufgabe.findUnique({
      where: { id: input.abhaengigVonId },
      select: { eventId: true },
    });

    if (
      !predecessor ||
      !isTaskDependencyInSameEvent({
        eventId: input.eventId,
        abhaengigVon: predecessor,
      })
    ) {
      throw new Error(
        "Die Vorgänger-Aufgabe muss zum selben Event gehören.",
      );
    }
  }

  await prisma.aufgabe.create({
    data: input,
  });

  revalidatePath("/");
}

async function updateTaskStatus(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Aufgaben-ID");
  const status = parseTaskStatus(String(formData.get("status") ?? ""));
  const task = await prisma.aufgabe.findUnique({
    where: { id },
    include: { abhaengigVon: true },
  });

  if (!task) {
    throw new Error(
      "Die Aufgabe wurde nicht gefunden. Bitte lade die Seite neu.",
    );
  }

  if (status === "erledigt" && !canCompleteTask(task)) {
    throw new Error(
      "Die Aufgabe kann erst erledigt werden, wenn die Vorgänger-Aufgabe erledigt ist.",
    );
  }

  await prisma.aufgabe.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/");
}

async function deleteTask(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Aufgaben-ID");

  await prisma.aufgabe.delete({
    where: { id },
  });

  revalidatePath("/");
}

async function createCommunication(formData: FormData) {
  "use server";

  const input = parseCommunicationInput({
    eventId: String(formData.get("eventId") ?? ""),
    kanal: String(formData.get("kanal") ?? "email"),
    datum: String(formData.get("datum") ?? ""),
    inhalt: String(formData.get("inhalt") ?? ""),
    istVerbindlich: formData.get("istVerbindlich") ? "on" : null,
    beteiligte: String(formData.get("beteiligte") ?? ""),
    erstelltVon: String(formData.get("erstelltVon") ?? ""),
  });

  await prisma.kommunikation.create({
    data: input,
  });

  revalidatePath("/");
}

async function deleteCommunication(formData: FormData) {
  "use server";

  const id = parseId(
    String(formData.get("id") ?? ""),
    "Kommunikations-ID",
  );

  await prisma.kommunikation.delete({
    where: { id },
  });

  revalidatePath("/");
}

async function createBudgetPosition(formData: FormData) {
  "use server";

  const input = parseBudgetInput({
    eventId: String(formData.get("eventId") ?? ""),
    bezeichnung: String(formData.get("bezeichnung") ?? ""),
    betragAngebot: String(formData.get("betragAngebot") ?? ""),
    betragBestaetigt: String(formData.get("betragBestaetigt") ?? ""),
    betragBezahlt: String(formData.get("betragBezahlt") ?? ""),
    dienstleisterId: String(formData.get("dienstleisterId") ?? ""),
  });

  await prisma.budgetPosition.create({
    data: input,
  });

  revalidatePath("/");
}

async function deleteBudgetPosition(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Budgetposition-ID");

  await prisma.budgetPosition.delete({
    where: { id },
  });

  revalidatePath("/");
}

async function createEventProvider(formData: FormData) {
  "use server";

  const input = parseEventProviderInput({
    eventId: String(formData.get("eventId") ?? ""),
    dienstleisterId: String(formData.get("dienstleisterId") ?? ""),
    status: String(formData.get("status") ?? "angefragt"),
    vertragsUrl: String(formData.get("vertragsUrl") ?? ""),
    stornofrist: String(formData.get("stornofrist") ?? ""),
    kritisch: formData.get("kritisch") ? "on" : null,
  });

  await prisma.eventDienstleister.create({
    data: input,
  });
  await syncProviderOutageEscalation(input.eventId);

  revalidatePath("/");
}

async function updateEventProvider(formData: FormData) {
  "use server";

  const input = parseEventProviderInput({
    eventId: String(formData.get("eventId") ?? ""),
    dienstleisterId: String(formData.get("dienstleisterId") ?? ""),
    status: String(formData.get("status") ?? "angefragt"),
    vertragsUrl: String(formData.get("vertragsUrl") ?? ""),
    stornofrist: String(formData.get("stornofrist") ?? ""),
    kritisch: formData.get("kritisch") ? "on" : null,
  });

  await prisma.eventDienstleister.update({
    where: {
      eventId_dienstleisterId: {
        eventId: input.eventId,
        dienstleisterId: input.dienstleisterId,
      },
    },
    data: {
      status: input.status,
      vertragsUrl: input.vertragsUrl,
      stornofrist: input.stornofrist,
      kritisch: input.kritisch,
    },
  });
  await syncProviderOutageEscalation(input.eventId);

  revalidatePath("/");
}

async function deleteEventProvider(formData: FormData) {
  "use server";

  const eventId = parseId(String(formData.get("eventId") ?? ""), "Event-ID");
  const dienstleisterId = parseId(
    String(formData.get("dienstleisterId") ?? ""),
    "Dienstleister-ID",
  );

  await prisma.eventDienstleister.delete({
    where: {
      eventId_dienstleisterId: {
        eventId,
        dienstleisterId,
      },
    },
  });
  await syncProviderOutageEscalation(eventId);

  revalidatePath("/");
}

async function syncProviderOutageEscalation(eventId: number) {
  const criticalOutageCount = await prisma.eventDienstleister.count({
    where: {
      eventId,
      kritisch: true,
      status: ESCALATION_CONFIG.providerOutage.criticalStatus,
    },
  });
  const eskaliert = criticalOutageCount > 0;

  const updates = [];

  if (ESCALATION_CONFIG.providerOutage.targets.tasks) {
    updates.push(
      prisma.aufgabe.updateMany({
        where: { eventId },
        data: { eskaliert },
      }),
    );
  }

  if (ESCALATION_CONFIG.providerOutage.targets.currentScheduleItems) {
    updates.push(
      prisma.ablaufpunkt.updateMany({
        where: {
          ablaufplan: {
            eventId,
            istAktuell: true,
          },
        },
        data: { eskaliert },
      }),
    );
  }

  await prisma.$transaction(updates);
}

export default async function Home() {
  const [events, providers] = await Promise.all([getEvents(), getProviders()]);
  const insights = buildEventInsights(events.map(toEventInsightInput)).slice(
    0,
    5,
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Event Management System</p>
          <h1>Projektübersicht</h1>
        </div>
        <div className={styles.headerActions}>
          <nav className={styles.quickNav} aria-label="Bereiche">
            <a href="#new-event-heading">Event anlegen</a>
            <a href="#events-heading">Events prüfen</a>
            <a href="#new-provider-heading">Dienstleister anlegen</a>
            <a href="#providers-heading">Dienstleister prüfen</a>
          </nav>
          <p className={styles.headerNote}>
            {events.length} Projekte · {providers.length} Dienstleister
          </p>
        </div>
      </header>

      <SmartInsights insights={insights} eventCount={events.length} />

      <section className={styles.workspace} aria-label="Event-Zentrale">
        <section className={styles.panel} aria-labelledby="new-event-heading">
          <h2 id="new-event-heading">Event anlegen</h2>
          <form action={createEvent} className={styles.form}>
            <label>
              Eventname
              <input name="name" required placeholder="Sommerfest 2026" />
            </label>

            <div className={styles.formGrid}>
              <label>
                Jahr
                <select name="datumJahr" defaultValue={EVENT_YEAR_OPTIONS[0]}>
                  {EVENT_YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Monat
                <select name="datumMonat" defaultValue="01">
                  {EVENT_MONTH_OPTIONS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tag
                <select name="datumTag" defaultValue="01">
                  {EVENT_DAY_OPTIONS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.formGrid}>
              <label>
                Status
                <select name="status" defaultValue="geplant">
                  {EVENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.formGrid}>
              <label>
                Geplante Gäste
                <input
                  name="gaesteanzahlGeplant"
                  type="number"
                  min="0"
                  step="1"
                  required
                  defaultValue="0"
                />
              </label>
              <label>
                Aktive Gäste
                <input
                  name="gaesteanzahlAktuell"
                  type="number"
                  min="0"
                  step="1"
                  required
                  defaultValue="0"
                />
              </label>
            </div>

            <label>
              Gesamtbudget (€)
              <input
                name="budgetGesamt"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue="0.00"
              />
            </label>

            <label>
              Notizen
              <textarea
                name="notizen"
                rows={4}
                placeholder="Interne Planungshinweise"
              />
            </label>

            <button type="submit">Event anlegen</button>
          </form>
        </section>

        <section className={styles.eventList} aria-labelledby="events-heading">
          <div className={styles.listHeader}>
            <h2 id="events-heading">Events</h2>
            <span>{events.length} Einträge</span>
          </div>

          {events.length === 0 ? (
            <p className={styles.emptyState}>
              Noch keine Events angelegt. Erstelle links das erste Event.
            </p>
          ) : (
            <div className={styles.cards}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} providers={providers} />
              ))}
            </div>
          )}
        </section>
      </section>

      <section className={styles.providerWorkspace} aria-label="Dienstleister">
        <section className={styles.panel} aria-labelledby="new-provider-heading">
          <h2 id="new-provider-heading">Dienstleister anlegen</h2>
          <form action={createProvider} className={styles.form}>
            <label>
              Name
              <input name="name" required placeholder="Licht & Ton GmbH" />
            </label>

            <div className={styles.formGrid}>
              <label>
                Kategorie
                <select name="kategorie" defaultValue="sonstige">
                  {PROVIDER_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {formatProviderCategory(category)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Backup-Dienstleister
                <select name="backupFuerId" defaultValue="">
                  <option value="">Kein Backup</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Ansprechpartner
              <input name="ansprechpartner" placeholder="Eva Technik" />
            </label>

            <div className={styles.formGrid}>
              <label>
                Mobiltelefon
                <input name="telefonMobil" placeholder="+49 ..." />
              </label>
              <label>
                E-Mail
                <input name="email" type="email" placeholder="kontakt@..." />
              </label>
            </div>

            <label>
              Zuverlässigkeitsnotiz
              <textarea
                name="zuverlaessigkeitsNotiz"
                rows={4}
                placeholder="Erfahrungen, Risiken, Backup-Hinweise"
              />
            </label>

            <button type="submit">Dienstleister anlegen</button>
          </form>
        </section>

        <section className={styles.eventList} aria-labelledby="providers-heading">
          <div className={styles.listHeader}>
            <h2 id="providers-heading">Dienstleister</h2>
            <span>{providers.length} Einträge</span>
          </div>

          {providers.length === 0 ? (
            <p className={styles.emptyState}>
              Noch keine Dienstleister erfasst.
            </p>
          ) : (
            <div className={styles.providerGrid}>
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  providers={providers}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function toEventInsightInput(event: EventListItem): EventInsightInput {
  const currentSchedule = event.ablaufplaene.find(
    (schedule) => schedule.istAktuell,
  );

  return {
    name: event.name,
    datum: event.datum,
    gaesteanzahlGeplant: event.gaesteanzahlGeplant,
    budgetGesamt: Number(event.budgetGesamt),
    budgetPruefbeduerftig: event.budgetPruefbeduerftig,
    gaeste: event.gaeste.map((guest) => ({
      anmeldestatus: guest.anmeldestatus,
    })),
    aufgaben: event.aufgaben.map((task) => ({
      status: task.status,
      pruefbeduerftig: task.pruefbeduerftig,
      eskaliert: task.eskaliert,
      abhaengigVon: task.abhaengigVon
        ? { status: task.abhaengigVon.status }
        : null,
    })),
    budgetPositionen: event.budgetPositionen.map((position) => ({
      betragBestaetigt: position.betragBestaetigt
        ? Number(position.betragBestaetigt)
        : null,
      pruefbeduerftig: position.pruefbeduerftig,
    })),
    aktuelleAblaufpunkte: currentSchedule
      ? currentSchedule.ablaufpunkte.map((item) => ({
          eskaliert: item.eskaliert,
        }))
      : [],
    verbindlicheKommunikation: filterBindingCommunications(
      event.kommunikationen,
    ).length,
  };
}

function SmartInsights({
  insights,
  eventCount,
}: {
  insights: EventInsight[];
  eventCount: number;
}) {
  return (
    <section className={styles.insightPanel} aria-labelledby="insights-heading">
      <div className={styles.insightHeader}>
        <div>
          <p className={styles.eyebrow}>Smart Assistenz</p>
          <h2 id="insights-heading">Nächste sinnvolle Schritte</h2>
        </div>
        <span>{insights.length} Hinweise</span>
      </div>

      {insights.length === 0 ? (
        <p className={styles.emptyState}>
          {eventCount === 0
            ? "Lege ein Event an, damit die Assistenz Prioritäten berechnen kann."
            : "Keine kritischen Hinweise. Prüfe Details in den Event-Karten."}
        </p>
      ) : (
        <div className={styles.insightGrid}>
          {insights.map((insight) => (
            <article
              className={styles.insightCard}
              key={`${insight.eventName}-${insight.title}`}
            >
              <div className={styles.insightCardHeader}>
                <span className={styles[`priority${insight.priority}`]}>
                  {formatInsightPriority(insight.priority)}
                </span>
                <strong>{insight.eventName}</strong>
              </div>
              <h3>{insight.title}</h3>
              <p>{insight.reason}</p>
              <small>{insight.nextStep}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatInsightPriority(priority: EventInsight["priority"]) {
  if (priority === "hoch") {
    return "Hohe Priorität";
  }

  if (priority === "mittel") {
    return "Mittlere Priorität";
  }

  return "Niedrige Priorität";
}

function EventCard({
  event,
  providers,
}: {
  event: EventListItem;
  providers: ProviderListItem[];
}) {
  const activeGuests = countActiveGuests(event);
  const waitlistGuests = event.gaeste.filter(
    (guest) => guest.anmeldestatus === "warteliste",
  ).length;
  const currentSchedule = event.ablaufplaene.find(
    (schedule) => schedule.istAktuell,
  );
  const offeredBudget = sumBudgetAmount(event.budgetPositionen, "betragAngebot");
  const confirmedBudget = sumBudgetAmount(
    event.budgetPositionen,
    "betragBestaetigt",
  );
  const paidBudget = sumBudgetAmount(event.budgetPositionen, "betragBezahlt");
  const assignedProviderIds = new Set(
    event.eventDienstleister.map((assignment) => assignment.dienstleisterId),
  );
  const availableProviders = providers.filter(
    (provider) => !assignedProviderIds.has(provider.id),
  );
  const bindingCommunications = filterBindingCommunications(
    event.kommunikationen,
  );
  const reviewItems =
    Number(event.budgetPruefbeduerftig) +
    event.aufgaben.filter((task) => task.pruefbeduerftig).length +
    event.budgetPositionen.filter((position) => position.pruefbeduerftig).length;
  const escalationItems =
    event.aufgaben.filter((task) => task.eskaliert).length +
    (currentSchedule?.ablaufpunkte.filter((item) => item.eskaliert).length ?? 0);
  const blockedTasks = event.aufgaben.filter(isTaskBlockedByDependency).length;
  const overdueTasks = event.aufgaben.filter(
    (task) => task.status === "ueberfaellig",
  ).length;

  return (
    <article className={styles.eventCard}>
      <div className={styles.cardMain}>
        <div>
          <span className={styles.status}>{formatStatus(event.status)}</span>
          {event.budgetPruefbeduerftig ? (
            <span className={styles.reviewBadge}>Prüfbedarf</span>
          ) : null}
          <h3>{event.name}</h3>
        </div>
        <p>{formatDate(event.datum)}</p>
      </div>

      <dl className={styles.eventFacts}>
        <div>
          <dt>Gäste</dt>
          <dd>
            {activeGuests}/{event.gaesteanzahlGeplant}
          </dd>
        </div>
        <div>
          <dt>Budget</dt>
          <dd>{formatCurrency(Number(event.budgetGesamt))}</dd>
        </div>
        <div>
          <dt>Bezahlt</dt>
          <dd>{formatCurrency(paidBudget)}</dd>
        </div>
        <div>
          <dt>Erstellt</dt>
          <dd>{formatDate(event.erstelltAm)}</dd>
        </div>
      </dl>

      {event.notizen ? <p className={styles.notes}>{event.notizen}</p> : null}

      <div className={styles.attentionStrip} aria-label="Wichtige Hinweise">
        <span>
          {reviewItems > 0 ? `${reviewItems} Prüfbedarf` : "Kein Prüfbedarf"}
        </span>
        <span>
          {escalationItems > 0
            ? `${escalationItems} Eskalationen`
            : "Keine Eskalation"}
        </span>
        <span>
          {blockedTasks > 0 ? `${blockedTasks} blockiert` : "Keine Blockade"}
        </span>
        <span>
          {overdueTasks > 0 ? `${overdueTasks} überfällig` : "Nichts überfällig"}
        </span>
      </div>

      <div className={styles.cardActions}>
        <form action={updateEventStatus}>
          <input type="hidden" name="id" value={event.id} />
          <label>
            Event-Status
            <select name="status" defaultValue={event.status}>
              {EVENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Event-Status speichern</button>
        </form>

        <form action={deleteEvent}>
          <input type="hidden" name="id" value={event.id} />
          <ConfirmSubmitButton
            className={styles.dangerButton}
            message={`Event "${event.name}" wirklich löschen?`}
          >
            Event löschen
          </ConfirmSubmitButton>
        </form>
      </div>

      <details className={styles.eventSection} open>
        <summary>
          <span>Budget</span>
          <small>{event.budgetPositionen.length} Positionen</small>
        </summary>
        <div className={styles.subHeader}>
          <h4>Budget</h4>
          <span>{event.budgetPositionen.length} Positionen</span>
        </div>

        <dl className={styles.budgetSummary}>
          <div>
            <dt>Angebote</dt>
            <dd>{formatCurrency(offeredBudget)}</dd>
          </div>
          <div>
            <dt>Bestätigt</dt>
            <dd>{formatCurrency(confirmedBudget)}</dd>
          </div>
          <div>
            <dt>Bezahlt</dt>
            <dd>{formatCurrency(paidBudget)}</dd>
          </div>
        </dl>

        <form action={createBudgetPosition} className={styles.budgetForm}>
          <input type="hidden" name="eventId" value={event.id} />
          <label className={styles.wideField}>
            Kostenposition
            <input name="bezeichnung" required placeholder="Catering" />
          </label>
          <label>
            Angebot (€)
            <input
              name="betragAngebot"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </label>
          <label>
            Bestätigt (€)
            <input
              name="betragBestaetigt"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </label>
          <label>
            Bezahlt (€)
            <input
              name="betragBezahlt"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </label>
          <label className={styles.wideField}>
            Dienstleister
            <select name="dienstleisterId" defaultValue="">
              <option value="">Keiner</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Kostenposition hinzufügen</button>
        </form>

        {event.budgetPositionen.length === 0 ? (
          <p className={styles.emptyGuests}>
            Noch keine Budgetpositionen erfasst.
          </p>
        ) : (
          <div className={styles.budgetList}>
            {event.budgetPositionen.map((position) => (
              <article key={position.id} className={styles.budgetItem}>
                <div>
                  {position.pruefbeduerftig ? (
                    <span className={styles.reviewBadge}>Prüfbedarf</span>
                  ) : null}
                  <strong>{position.bezeichnung}</strong>
                  <p>
                    Angebot: {formatOptionalCurrency(position.betragAngebot)} ·{" "}
                    Bestätigt:{" "}
                    {formatOptionalCurrency(position.betragBestaetigt)} ·{" "}
                    Bezahlt: {formatOptionalCurrency(position.betragBezahlt)}
                  </p>
                  <p>
                    Dienstleister:{" "}
                    {position.dienstleister?.name || "nicht zugeordnet"}
                  </p>
                </div>

                <form action={deleteBudgetPosition} className={styles.budgetActions}>
                  <input type="hidden" name="id" value={position.id} />
                  <ConfirmSubmitButton
                    className={styles.dangerButton}
                    message={`Kostenposition "${position.bezeichnung}" wirklich löschen?`}
                  >
                    Kostenposition löschen
                  </ConfirmSubmitButton>
                </form>
              </article>
            ))}
          </div>
        )}
      </details>

      <details className={styles.eventSection}>
        <summary>
          <span>Dienstleister</span>
          <small>{event.eventDienstleister.length} Zuordnungen</small>
        </summary>
        <div className={styles.subHeader}>
          <h4>Dienstleister</h4>
          <span>{event.eventDienstleister.length} Zuordnungen</span>
        </div>

        {providers.length === 0 ? (
          <p className={styles.emptyGuests}>
            Lege zuerst zentrale Dienstleister an.
          </p>
        ) : (
          <form
            action={createEventProvider}
            className={styles.assignmentForm}
          >
            <input type="hidden" name="eventId" value={event.id} />
            <label className={styles.wideField}>
              Dienstleister
              <select
                name="dienstleisterId"
                required
                defaultValue={availableProviders[0]?.id ?? ""}
                disabled={availableProviders.length === 0}
              >
                {availableProviders.length === 0 ? (
                  <option value="">Alle zugeordnet</option>
                ) : (
                  availableProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue="angefragt">
                {EVENT_PROVIDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatEventProviderStatus(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.wideField}>
              Vertrag-Link
              <input
                name="vertragsUrl"
                type="url"
                placeholder="https://..."
                disabled={availableProviders.length === 0}
              />
            </label>
            <label>
              Stornofrist
              <input
                name="stornofrist"
                type="date"
                disabled={availableProviders.length === 0}
              />
            </label>
            <label className={styles.checkboxLabel}>
              <input
                name="kritisch"
                type="checkbox"
                disabled={availableProviders.length === 0}
              />
              Kritischer Dienstleister
            </label>
            <button type="submit" disabled={availableProviders.length === 0}>
              Dienstleister zuordnen
            </button>
          </form>
        )}

        {event.eventDienstleister.length === 0 ? (
          <p className={styles.emptyGuests}>
            Noch keine Dienstleister zugeordnet.
          </p>
        ) : (
          <div className={styles.assignmentList}>
            {event.eventDienstleister.map((assignment) => (
              <article
                key={`${assignment.eventId}-${assignment.dienstleisterId}`}
                className={styles.assignmentItem}
              >
                <div>
                  <div className={styles.badgeRow}>
                    <span className={styles.status}>
                      {formatEventProviderStatus(assignment.status)}
                    </span>
                    {assignment.kritisch ? (
                      <span className={styles.reviewBadge}>Kritisch</span>
                    ) : null}
                    {triggersProviderOutageEscalation(assignment) ? (
                      <span className={styles.escalationBadge}>
                        Eskalation
                      </span>
                    ) : null}
                  </div>
                  <strong>{assignment.dienstleister.name}</strong>
                  <p>
                    {formatProviderCategory(assignment.dienstleister.kategorie)} ·{" "}
                    Stornofrist:{" "}
                    {assignment.stornofrist
                      ? formatDate(assignment.stornofrist)
                      : "nicht gesetzt"}
                  </p>
                  <p>
                    Vertrag:{" "}
                    {assignment.vertragsUrl ? (
                      <a href={assignment.vertragsUrl}>{assignment.vertragsUrl}</a>
                    ) : (
                      "nicht hinterlegt"
                    )}
                  </p>
                </div>

                <div className={styles.assignmentActions}>
                  <form action={updateEventProvider}>
                    <input type="hidden" name="eventId" value={event.id} />
                    <input
                      type="hidden"
                      name="dienstleisterId"
                      value={assignment.dienstleisterId}
                    />
                    <label>
                      Status
                      <select name="status" defaultValue={assignment.status}>
                        {EVENT_PROVIDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {formatEventProviderStatus(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Vertrag-Link
                      <input
                        name="vertragsUrl"
                        type="url"
                        defaultValue={assignment.vertragsUrl ?? ""}
                        placeholder="https://..."
                      />
                    </label>
                    <label>
                      Stornofrist
                      <input
                        name="stornofrist"
                        type="date"
                        defaultValue={formatDateInput(assignment.stornofrist)}
                      />
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        name="kritisch"
                        type="checkbox"
                        defaultChecked={assignment.kritisch}
                      />
                      Kritischer Dienstleister
                    </label>
                    <button type="submit">Zuordnung speichern</button>
                  </form>

                  <form action={deleteEventProvider}>
                    <input type="hidden" name="eventId" value={event.id} />
                    <input
                      type="hidden"
                      name="dienstleisterId"
                      value={assignment.dienstleisterId}
                    />
                    <ConfirmSubmitButton
                      className={styles.dangerButton}
                      message={`Zuordnung zu "${assignment.dienstleister.name}" wirklich entfernen?`}
                    >
                      Zuordnung entfernen
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </details>

      <details className={styles.eventSection} open>
        <summary>
          <span>Gäste</span>
          <small>
            {activeGuests} aktiv · {waitlistGuests} Warteliste
          </small>
        </summary>
        <div className={styles.subHeader}>
          <h4>Gäste</h4>
          <span>
            {activeGuests} aktiv · {waitlistGuests} Warteliste
          </span>
        </div>

        <form action={createGuest} className={styles.guestForm}>
          <input type="hidden" name="eventId" value={event.id} />
          <fieldset className={styles.formSection}>
            <legend>Personendaten</legend>
            <label>
              Name
              <input name="name" required placeholder="Max Mustermann" />
            </label>
            <label>
              E-Mail
              <input name="email" type="email" placeholder="max@example.com" />
            </label>
            <label>
              Telefon
              <input name="telefon" placeholder="+49 ..." />
            </label>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend>Teilnahme</legend>
            <label>
              Gasttyp
              <select name="typ" defaultValue="standard">
                {GUEST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatGuestType(type)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Anmeldestatus
              <select name="anmeldestatus" defaultValue="angemeldet">
                {GUEST_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatGuestStatus(status)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tisch
              <input name="tischzuweisung" placeholder="Tisch 4" />
            </label>
          </fieldset>

          <fieldset className={styles.formSection}>
            <legend>Anforderungen</legend>
            <label>
              Ernährung
              <input name="ernaehrung" placeholder="vegetarisch" />
            </label>
            <label>
              Allergien
              <input name="allergien" placeholder="Nüsse" />
            </label>
            <label>
              VIP-Anforderungen
              <input name="vipAnforderungen" placeholder="Transfer, Backstage" />
            </label>
          </fieldset>
          <button type="submit">Gast hinzufügen</button>
        </form>

        {event.gaeste.length === 0 ? (
          <p className={styles.emptyGuests}>Noch keine Gäste erfasst.</p>
        ) : (
          <div className={styles.guestList}>
            {event.gaeste.map((guest) => (
              <article key={guest.id} className={styles.guestItem}>
                <div className={styles.guestDetails}>
                  <div className={styles.guestDetail}>
                    <span>Name</span>
                    <strong>{guest.name}</strong>
                  </div>
                  <div className={styles.guestDetail}>
                    <span>Typ</span>
                    <p>{formatGuestType(guest.typ)}</p>
                  </div>
                  <div className={styles.guestDetail}>
                    <span>E-Mail</span>
                    <p>{guest.email || "keine E-Mail"}</p>
                  </div>
                  <div className={styles.guestDetail}>
                    <span>Telefon</span>
                    <p>{guest.telefon || "kein Telefon"}</p>
                  </div>
                  <div className={styles.guestDetail}>
                    <span>Ernährung</span>
                    <p>{guest.ernaehrung || "Keine Angabe"}</p>
                  </div>
                  <div className={styles.guestDetail}>
                    <span>Allergien</span>
                    <p>{guest.allergien || "Keine Angabe"}</p>
                  </div>
                  <div className={styles.guestDetail}>
                    <span>Tisch</span>
                    <p>{guest.tischzuweisung || "Nicht zugewiesen"}</p>
                  </div>
                  <div className={styles.guestDetail}>
                    <span>Status</span>
                    <p>{formatGuestStatus(guest.anmeldestatus)}</p>
                  </div>
                  {guest.vipAnforderungen ? (
                    <div className={styles.guestVipDetail}>
                      <span>VIP-Anforderungen</span>
                      <p>{guest.vipAnforderungen}</p>
                    </div>
                  ) : null}
                </div>

                <div className={styles.guestActions}>
                  <form action={updateGuestStatus}>
                    <input type="hidden" name="id" value={guest.id} />
                    <input type="hidden" name="eventId" value={event.id} />
                    <label>
                      Neuer Status
                      <select
                        name="anmeldestatus"
                        defaultValue={guest.anmeldestatus}
                      >
                        {GUEST_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {formatGuestStatus(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="submit">Gaststatus speichern</button>
                  </form>

                  <form action={deleteGuest}>
                    <input type="hidden" name="id" value={guest.id} />
                    <input type="hidden" name="eventId" value={event.id} />
                    <ConfirmSubmitButton
                      className={styles.dangerButton}
                      message={`Gast "${guest.name}" wirklich löschen?`}
                    >
                      Gast löschen
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </details>

      <details className={styles.eventSection}>
        <summary>
          <span>Ablauf</span>
          <small>
            {currentSchedule
              ? `Version ${currentSchedule.version}`
              : "Kein Ablaufplan"}
          </small>
        </summary>
        <div className={styles.subHeader}>
          <h4>Ablauf</h4>
          <span>
            {currentSchedule
              ? `Version ${currentSchedule.version}`
              : "Kein Ablaufplan"}
          </span>
        </div>

        {event.ablaufplaene.length > 0 ? (
          <div className={styles.scheduleHistory}>
            {event.ablaufplaene.map((schedule) => (
              <span key={schedule.id}>
                Version {schedule.version}
                {schedule.istAktuell ? " · aktuell" : ""}
              </span>
            ))}
          </div>
        ) : null}

        {currentSchedule ? (
          <>
            <form action={createScheduleItem} className={styles.scheduleForm}>
              <input
                type="hidden"
                name="ablaufplanId"
                value={currentSchedule.id}
              />
              <label>
                Start
                <input name="uhrzeitStart" type="datetime-local" required />
              </label>
              <label>
                Ende
                <input name="uhrzeitEnde" type="datetime-local" />
              </label>
              <label className={styles.wideField}>
                Bezeichnung
                <input name="bezeichnung" required placeholder="Einlass" />
              </label>
              <label>
                Verantwortlich
                <input name="verantwortlich" placeholder="Event-Team" />
              </label>
              <label className={styles.checkboxLabel}>
                <input name="istPuffer" type="checkbox" />
                Puffer
              </label>
              <label className={styles.checkboxLabel}>
                <input name="sichtbarFuerDienstleister" type="checkbox" />
                Für Dienstleister sichtbar
              </label>
              <button type="submit">Programmpunkt hinzufügen</button>
            </form>

            {currentSchedule.ablaufpunkte.length === 0 ? (
              <p className={styles.emptyGuests}>
                Noch keine Ablaufpunkte erfasst.
              </p>
            ) : (
              <ol className={styles.scheduleList}>
                {currentSchedule.ablaufpunkte.map((item) => (
                  <li key={item.id} className={styles.scheduleItem}>
                    <div>
                      <time>{formatTimeRange(item.uhrzeitStart, item.uhrzeitEnde)}</time>
                      {item.eskaliert ? (
                        <span className={styles.escalationBadge}>
                          Eskaliert
                        </span>
                      ) : null}
                      <strong>{item.bezeichnung}</strong>
                      <p>
                        {item.verantwortlich || "Keine Verantwortung"} ·{" "}
                        {item.istPuffer ? "Puffer" : "Programmpunkt"} ·{" "}
                        {item.sichtbarFuerDienstleister
                          ? "Dienstleister sichtbar"
                          : "Intern"}
                      </p>
                    </div>
                    <form action={deleteScheduleItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <ConfirmSubmitButton
                        className={styles.dangerButton}
                        message={`Programmpunkt "${item.bezeichnung}" wirklich löschen?`}
                      >
                        Programmpunkt löschen
                      </ConfirmSubmitButton>
                    </form>
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : (
          <form action={createSchedulePlan} className={styles.inlineActions}>
            <input type="hidden" name="eventId" value={event.id} />
            <button type="submit">Ablaufplan starten</button>
          </form>
        )}
      </details>

      <details className={styles.eventSection}>
        <summary>
          <span>Aufgaben</span>
          <small>{event.aufgaben.length} Einträge</small>
        </summary>
        <div className={styles.subHeader}>
          <h4>Aufgaben</h4>
          <span>{event.aufgaben.length} Einträge</span>
        </div>

        <form action={createTask} className={styles.taskForm}>
          <input type="hidden" name="eventId" value={event.id} />
          <label className={styles.wideField}>
            Aufgabe
            <input
              name="bezeichnung"
              required
              placeholder="Catering bestätigen"
            />
          </label>
          <label>
            Fällig
            <input name="faelligAm" type="datetime-local" />
          </label>
          <label>
            Status
            <select name="status" defaultValue="offen">
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatTaskStatus(status)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Abhängig von
            <select name="abhaengigVonId" defaultValue="">
              <option value="">Keine</option>
              {event.aufgaben.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.bezeichnung}
                </option>
              ))}
            </select>
          </label>
          <label>
            Zugewiesen an
            <input name="zugewiesenAn" placeholder="Team Planung" />
          </label>
          <label>
            Erinnerung
            <input name="erinnerungAm" type="datetime-local" />
          </label>
          <button type="submit">Aufgabe hinzufügen</button>
        </form>

        {event.aufgaben.length === 0 ? (
          <p className={styles.emptyGuests}>Noch keine Aufgaben erfasst.</p>
        ) : (
          <div className={styles.taskList}>
            {event.aufgaben.map((task) => (
              <article key={task.id} className={styles.taskItem}>
                <div>
                  <div className={styles.badgeRow}>
                    <span className={styles.status}>
                      {formatTaskStatus(task.status)}
                    </span>
                    {isTaskBlockedByDependency(task) ? (
                      <span className={styles.blockedBadge}>Blockiert</span>
                    ) : null}
                    {task.eskaliert ? (
                      <span className={styles.escalationBadge}>
                        Eskaliert
                      </span>
                    ) : null}
                    {task.pruefbeduerftig ? (
                      <span className={styles.reviewBadge}>Prüfbedarf</span>
                    ) : null}
                  </div>
                  <strong>{task.bezeichnung}</strong>
                  <p>
                    Fällig: {task.faelligAm ? formatDateTime(task.faelligAm) : "offen"} ·{" "}
                    Zugewiesen: {task.zugewiesenAn || "nicht gesetzt"}
                  </p>
                  <p>
                    Abhängig von: {task.abhaengigVon?.bezeichnung || "keiner"} ·{" "}
                    Erinnerung:{" "}
                    {task.erinnerungAm ? formatDateTime(task.erinnerungAm) : "keine"}
                  </p>
                  {task.blockiert.length > 0 ? (
                    <p>Blockiert: {task.blockiert.length} Aufgabe(n)</p>
                  ) : null}
                </div>

                <div className={styles.taskActions}>
                  <form action={updateTaskStatus}>
                    <input type="hidden" name="id" value={task.id} />
                    <select name="status" defaultValue={task.status}>
                      {TASK_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {formatTaskStatus(status)}
                        </option>
                      ))}
                    </select>
                    <button type="submit">Aufgabenstatus speichern</button>
                  </form>

                  <form action={deleteTask}>
                    <input type="hidden" name="id" value={task.id} />
                    <ConfirmSubmitButton
                      className={styles.dangerButton}
                      message={`Aufgabe "${task.bezeichnung}" wirklich löschen?`}
                    >
                      Aufgabe löschen
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </details>

      <details className={styles.eventSection}>
        <summary>
          <span>Kommunikation</span>
          <small>
            {bindingCommunications.length} verbindlich ·{" "}
            {event.kommunikationen.length} gesamt
          </small>
        </summary>
        <div className={styles.subHeader}>
          <h4>Kommunikation</h4>
          <span>
            {bindingCommunications.length} verbindlich ·{" "}
            {event.kommunikationen.length} gesamt
          </span>
        </div>

        <form action={createCommunication} className={styles.communicationForm}>
          <input type="hidden" name="eventId" value={event.id} />
          <label>
            Kanal
            <select name="kanal" defaultValue="email">
              {COMMUNICATION_CHANNELS.map((channel) => (
                <option key={channel} value={channel}>
                  {formatCommunicationChannel(channel)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Datum
            <input name="datum" type="datetime-local" required />
          </label>
          <label className={styles.wideField}>
            Inhalt
            <textarea
              name="inhalt"
              rows={3}
              required
              placeholder="Absprache oder Notiz"
            />
          </label>
          <label>
            Beteiligte
            <input name="beteiligte" placeholder="Kunde, Dienstleister" />
          </label>
          <label>
            Erstellt von
            <input name="erstelltVon" placeholder="Event-Team" />
          </label>
          <label className={styles.checkboxLabel}>
            <input name="istVerbindlich" type="checkbox" />
            Verbindlich
          </label>
          <button type="submit">Kommunikation speichern</button>
        </form>

        {event.kommunikationen.length === 0 ? (
          <p className={styles.emptyGuests}>
            Noch keine Kommunikation erfasst.
          </p>
        ) : (
          <>
            <div className={styles.bindingSummary}>
              <h5>Verbindliche Grundlagen</h5>
              {bindingCommunications.length === 0 ? (
                <p>Keine verbindlichen Absprachen erfasst.</p>
              ) : (
                <ul>
                  {bindingCommunications.map((communication) => (
                    <li key={communication.id}>
                      <strong>{formatDateTime(communication.datum)}</strong>
                      <span>{communication.inhalt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.communicationList}>
              {event.kommunikationen.map((communication) => (
                <article
                  key={communication.id}
                  className={styles.communicationItem}
                >
                  <div>
                    <div className={styles.badgeRow}>
                      <span className={styles.status}>
                        {formatCommunicationChannel(communication.kanal)}
                      </span>
                      <span
                        className={
                          communication.istVerbindlich
                            ? styles.bindingBadge
                            : styles.noteBadge
                        }
                      >
                        {communication.istVerbindlich
                          ? "Verbindlich"
                          : "Notiz"}
                      </span>
                    </div>
                    <strong>{formatDateTime(communication.datum)}</strong>
                    <p>{communication.inhalt}</p>
                    <p>
                      Beteiligte: {communication.beteiligte || "nicht erfasst"} ·{" "}
                      Erstellt von: {communication.erstelltVon || "nicht erfasst"}
                    </p>
                  </div>

                  <form
                    action={deleteCommunication}
                    className={styles.communicationActions}
                  >
                    <input type="hidden" name="id" value={communication.id} />
                    <ConfirmSubmitButton
                      className={styles.dangerButton}
                      message="Kommunikationseintrag wirklich löschen?"
                    >
                      Kommunikation löschen
                    </ConfirmSubmitButton>
                  </form>
                </article>
              ))}
            </div>
          </>
        )}
      </details>
    </article>
  );
}

function countActiveGuests(event: EventListItem) {
  return event.gaeste.filter((guest) => isActiveGuestStatus(guest.anmeldestatus))
    .length;
}

function sumBudgetAmount(
  positions: EventListItem["budgetPositionen"],
  field: "betragAngebot" | "betragBestaetigt" | "betragBezahlt",
) {
  return positions.reduce((sum, position) => {
    const amount = position[field];
    return sum + (amount ? Number(amount) : 0);
  }, 0);
}

function ProviderCard({
  provider,
  providers,
}: {
  provider: ProviderListItem;
  providers: ProviderListItem[];
}) {
  return (
    <article className={styles.providerCard}>
      <div className={styles.cardMain}>
        <div>
          <span className={styles.status}>
            {formatProviderCategory(provider.kategorie)}
          </span>
          <h3>{provider.name}</h3>
        </div>
      </div>

      <form action={updateProvider} className={styles.providerEditForm}>
        <input type="hidden" name="id" value={provider.id} />
        <label>
          Name
          <input name="name" required defaultValue={provider.name} />
        </label>
        <label>
          Kategorie
          <select name="kategorie" defaultValue={provider.kategorie}>
            {PROVIDER_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {formatProviderCategory(category)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Backup-Dienstleister
          <select name="backupFuerId" defaultValue={provider.backupFuerId ?? ""}>
            <option value="">Kein Backup</option>
            {providers
              .filter((backup) => backup.id !== provider.id)
              .map((backup) => (
                <option key={backup.id} value={backup.id}>
                  {backup.name}
                </option>
              ))}
          </select>
        </label>
        <label>
          Ansprechpartner
          <input
            name="ansprechpartner"
            defaultValue={provider.ansprechpartner ?? ""}
          />
        </label>
        <label>
          Mobil
          <input name="telefonMobil" defaultValue={provider.telefonMobil ?? ""} />
        </label>
        <label>
          E-Mail
          <input name="email" type="email" defaultValue={provider.email ?? ""} />
        </label>
        <label className={styles.wideField}>
          Zuverlässigkeitsnotiz
          <textarea
            name="zuverlaessigkeitsNotiz"
            rows={3}
            defaultValue={provider.zuverlaessigkeitsNotiz ?? ""}
          />
        </label>
        <button type="submit">Dienstleister speichern</button>
      </form>

      <form action={deleteProvider} className={styles.inlineActions}>
        <input type="hidden" name="id" value={provider.id} />
        <ConfirmSubmitButton
          className={styles.dangerButton}
          message={`Dienstleister "${provider.name}" wirklich löschen?`}
        >
          Dienstleister löschen
        </ConfirmSubmitButton>
      </form>
    </article>
  );
}
