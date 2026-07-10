import { revalidatePath } from "next/cache";
import styles from "./page.module.css";
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
  parseProviderInput,
} from "@/lib/provider-input";
import {
  parseScheduleItemInput,
  parseSchedulePlanInput,
} from "@/lib/schedule-input";

export const dynamic = "force-dynamic";

type EventListItem = Awaited<ReturnType<typeof getEvents>>[number];
type ProviderListItem = Awaited<ReturnType<typeof getProviders>>[number];

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
    },
    orderBy: [{ datum: "asc" }, { erstelltAm: "desc" }],
  });
}

async function getProviders() {
  return prisma.dienstleister.findMany({
    include: {
      backupFuer: true,
      backupDienstleister: true,
    },
    orderBy: [{ kategorie: "asc" }, { name: "asc" }],
  });
}

async function createEvent(formData: FormData) {
  "use server";

  const input = parseEventInput({
    name: String(formData.get("name") ?? ""),
    datum: String(formData.get("datum") ?? ""),
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

async function updateEventStatus(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));
  const status = parseEventStatus(String(formData.get("status") ?? ""));

  if (!Number.isInteger(id)) {
    throw new Error("Ungueltige Event-ID.");
  }

  await prisma.event.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/");
}

async function deleteEvent(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id)) {
    throw new Error("Ungueltige Event-ID.");
  }

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

  await prisma.gast.create({
    data: input,
  });
  await syncEventGuestCount(input.eventId);

  revalidatePath("/");
}

async function updateGuestStatus(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Gast-ID");
  const eventId = parseId(String(formData.get("eventId") ?? ""), "Event-ID");
  const anmeldestatus = parseGuestStatus(
    String(formData.get("anmeldestatus") ?? ""),
  );

  await prisma.gast.update({
    where: { id },
    data: { anmeldestatus },
  });
  await syncEventGuestCount(eventId);

  revalidatePath("/");
}

async function deleteGuest(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Gast-ID");
  const eventId = parseId(String(formData.get("eventId") ?? ""), "Event-ID");

  await prisma.gast.delete({
    where: { id },
  });
  await syncEventGuestCount(eventId);

  revalidatePath("/");
}

async function syncEventGuestCount(eventId: number) {
  const activeGuests = await prisma.gast.count({
    where: {
      eventId,
      anmeldestatus: {
        not: "abgesagt",
      },
    },
  });

  await prisma.event.update({
    where: { id: eventId },
    data: { gaesteanzahlAktuell: activeGuests },
  });
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

async function createSchedulePlan(formData: FormData) {
  "use server";

  const input = parseSchedulePlanInput({
    eventId: String(formData.get("eventId") ?? ""),
  });
  const existingCurrentPlan = await prisma.ablaufplan.findFirst({
    where: {
      eventId: input.eventId,
      istAktuell: true,
    },
  });

  if (!existingCurrentPlan) {
    await prisma.ablaufplan.create({
      data: {
        eventId: input.eventId,
        version: 1,
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

  await prisma.ablaufpunkt.create({
    data: input,
  });

  revalidatePath("/");
}

async function deleteScheduleItem(formData: FormData) {
  "use server";

  const id = parseId(String(formData.get("id") ?? ""), "Ablaufpunkt-ID");

  await prisma.ablaufpunkt.delete({
    where: { id },
  });

  revalidatePath("/");
}

export default async function Home() {
  const [events, providers] = await Promise.all([getEvents(), getProviders()]);
  const totalBudget = events.reduce(
    (sum, event) => sum + Number(event.budgetGesamt),
    0,
  );
  const plannedGuests = events.reduce(
    (sum, event) => sum + event.gaesteanzahlGeplant,
    0,
  );
  const currentGuests = events.reduce(
    (sum, event) => sum + countActiveGuests(event),
    0,
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Event Management System</p>
          <h1>Event-Zentrale</h1>
        </div>
        <dl className={styles.metrics} aria-label="Event-Kennzahlen">
          <Metric label="Events" value={events.length.toString()} />
          <Metric label="Gaeste" value={`${currentGuests}/${plannedGuests}`} />
          <Metric label="Budget" value={formatCurrency(totalBudget)} />
        </dl>
      </header>

      <section className={styles.workspace} aria-label="Event-Zentrale">
        <section className={styles.panel} aria-labelledby="new-event-heading">
          <h2 id="new-event-heading">Neues Event</h2>
          <form action={createEvent} className={styles.form}>
            <label>
              Name
              <input name="name" required placeholder="Sommerfest 2026" />
            </label>

            <div className={styles.formGrid}>
              <label>
                Datum
                <input name="datum" type="date" required />
              </label>
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
                Geplant
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
                Aktuell
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
              Gesamtbudget
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
            <span>{events.length} Eintraege</span>
          </div>

          {events.length === 0 ? (
            <p className={styles.emptyState}>
              Noch keine Events angelegt. Erstelle links das erste Event.
            </p>
          ) : (
            <div className={styles.cards}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      </section>

      <section className={styles.providerWorkspace} aria-label="Dienstleister">
        <section className={styles.panel} aria-labelledby="new-provider-heading">
          <h2 id="new-provider-heading">Neuer Dienstleister</h2>
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
                Backup fuer
                <select name="backupFuerId" defaultValue="">
                  <option value="">Keinen</option>
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
              Zuverlaessigkeit
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
            <span>{providers.length} Eintraege</span>
          </div>

          {providers.length === 0 ? (
            <p className={styles.emptyState}>
              Noch keine Dienstleister erfasst.
            </p>
          ) : (
            <div className={styles.providerGrid}>
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function EventCard({ event }: { event: EventListItem }) {
  const activeGuests = countActiveGuests(event);
  const currentSchedule = event.ablaufplaene.find(
    (schedule) => schedule.istAktuell,
  );

  return (
    <article className={styles.eventCard}>
      <div className={styles.cardMain}>
        <div>
          <span className={styles.status}>{formatStatus(event.status)}</span>
          <h3>{event.name}</h3>
        </div>
        <p>{formatDate(event.datum)}</p>
      </div>

      <dl className={styles.eventFacts}>
        <div>
          <dt>Gaeste</dt>
          <dd>
            {activeGuests}/{event.gaesteanzahlGeplant}
          </dd>
        </div>
        <div>
          <dt>Budget</dt>
          <dd>{formatCurrency(Number(event.budgetGesamt))}</dd>
        </div>
        <div>
          <dt>Erstellt</dt>
          <dd>{formatDate(event.erstelltAm)}</dd>
        </div>
      </dl>

      {event.notizen ? <p className={styles.notes}>{event.notizen}</p> : null}

      <div className={styles.cardActions}>
        <form action={updateEventStatus}>
          <input type="hidden" name="id" value={event.id} />
          <select name="status" defaultValue={event.status}>
            {EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
          <button type="submit">Status speichern</button>
        </form>

        <form action={deleteEvent}>
          <input type="hidden" name="id" value={event.id} />
          <button className={styles.dangerButton} type="submit">
            Loeschen
          </button>
        </form>
      </div>

      <section className={styles.guestSection} aria-label={`Gaeste ${event.name}`}>
        <div className={styles.subHeader}>
          <h4>Gaeste</h4>
          <span>{event.gaeste.length} Datensaetze</span>
        </div>

        <form action={createGuest} className={styles.guestForm}>
          <input type="hidden" name="eventId" value={event.id} />
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
          <label>
            Typ
            <select name="typ" defaultValue="standard">
              {GUEST_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatGuestType(type)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="anmeldestatus" defaultValue="angemeldet">
              {GUEST_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatGuestStatus(status)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ernaehrung
            <input name="ernaehrung" placeholder="vegetarisch" />
          </label>
          <label>
            Allergien
            <input name="allergien" placeholder="Nuesse" />
          </label>
          <label>
            Tisch
            <input name="tischzuweisung" placeholder="Tisch 4" />
          </label>
          <label className={styles.wideField}>
            VIP-Anforderungen
            <input name="vipAnforderungen" placeholder="Transfer, Backstage" />
          </label>
          <button type="submit">Gast hinzufuegen</button>
        </form>

        {event.gaeste.length === 0 ? (
          <p className={styles.emptyGuests}>Noch keine Gaeste erfasst.</p>
        ) : (
          <div className={styles.guestList}>
            {event.gaeste.map((guest) => (
              <article key={guest.id} className={styles.guestItem}>
                <div>
                  <strong>{guest.name}</strong>
                  <p>
                    {formatGuestType(guest.typ)} ·{" "}
                    {guest.email || "keine E-Mail"} ·{" "}
                    {guest.telefon || "kein Telefon"}
                  </p>
                  <p>
                    {[guest.ernaehrung, guest.allergien, guest.tischzuweisung]
                      .filter(Boolean)
                      .join(" · ") || "Keine Anforderungen erfasst"}
                  </p>
                  {guest.vipAnforderungen ? (
                    <p>VIP: {guest.vipAnforderungen}</p>
                  ) : null}
                </div>

                <div className={styles.guestActions}>
                  <form action={updateGuestStatus}>
                    <input type="hidden" name="id" value={guest.id} />
                    <input type="hidden" name="eventId" value={event.id} />
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
                    <button type="submit">Status</button>
                  </form>

                  <form action={deleteGuest}>
                    <input type="hidden" name="id" value={guest.id} />
                    <input type="hidden" name="eventId" value={event.id} />
                    <button className={styles.dangerButton} type="submit">
                      Loeschen
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section
        className={styles.guestSection}
        aria-label={`Ablauf ${event.name}`}
      >
        <div className={styles.subHeader}>
          <h4>Ablauf</h4>
          <span>
            {currentSchedule
              ? `Version ${currentSchedule.version}`
              : "Kein Ablaufplan"}
          </span>
        </div>

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
                Fuer Dienstleister sichtbar
              </label>
              <button type="submit">Ablaufpunkt hinzufuegen</button>
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
                      <button className={styles.dangerButton} type="submit">
                        Loeschen
                      </button>
                    </form>
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : (
          <form action={createSchedulePlan} className={styles.inlineActions}>
            <input type="hidden" name="eventId" value={event.id} />
            <button type="submit">Ablaufplan v1 erstellen</button>
          </form>
        )}
      </section>
    </article>
  );
}

function countActiveGuests(event: EventListItem) {
  return event.gaeste.filter((guest) => guest.anmeldestatus !== "abgesagt")
    .length;
}

function ProviderCard({ provider }: { provider: ProviderListItem }) {
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

      <dl className={styles.providerFacts}>
        <div>
          <dt>Ansprechpartner</dt>
          <dd>{provider.ansprechpartner || "Nicht hinterlegt"}</dd>
        </div>
        <div>
          <dt>Mobil</dt>
          <dd>{provider.telefonMobil || "Nicht hinterlegt"}</dd>
        </div>
        <div>
          <dt>E-Mail</dt>
          <dd>{provider.email || "Nicht hinterlegt"}</dd>
        </div>
        <div>
          <dt>Backup fuer</dt>
          <dd>{provider.backupFuer?.name || "Keinen"}</dd>
        </div>
      </dl>

      {provider.zuverlaessigkeitsNotiz ? (
        <p className={styles.notes}>{provider.zuverlaessigkeitsNotiz}</p>
      ) : null}

      {provider.backupDienstleister.length > 0 ? (
        <p className={styles.notes}>
          Backup-Dienstleister:{" "}
          {provider.backupDienstleister.map((backup) => backup.name).join(", ")}
        </p>
      ) : null}

      <form action={deleteProvider} className={styles.inlineActions}>
        <input type="hidden" name="id" value={provider.id} />
        <button className={styles.dangerButton} type="submit">
          Loeschen
        </button>
      </form>
    </article>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatTimeRange(start: Date, end: Date | null) {
  const formatter = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!end) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    geplant: "Geplant",
    laufend: "Laufend",
    abgeschlossen: "Abgeschlossen",
    storniert: "Storniert",
  };

  return labels[status] ?? status;
}

function formatGuestType(type: string) {
  const labels: Record<string, string> = {
    standard: "Standard",
    vip: "VIP",
    speaker: "Speaker",
    dienstleister_gast: "Dienstleister-Gast",
  };

  return labels[type] ?? type;
}

function formatGuestStatus(status: string) {
  const labels: Record<string, string> = {
    angemeldet: "Angemeldet",
    abgesagt: "Abgesagt",
    warteliste: "Warteliste",
    bestaetigt: "Bestaetigt",
  };

  return labels[status] ?? status;
}

function formatProviderCategory(category: string) {
  const labels: Record<string, string> = {
    catering: "Catering",
    technik: "Technik",
    location: "Location",
    dekoration: "Dekoration",
    moderation: "Moderation",
    security: "Security",
    sonstige: "Sonstige",
  };

  return labels[category] ?? category;
}
