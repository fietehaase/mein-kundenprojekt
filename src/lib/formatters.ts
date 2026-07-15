export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateInput(date: Date | null) {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function formatTimeRange(start: Date, end: Date | null) {
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

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatOptionalCurrency(amount: unknown) {
  if (amount === null || amount === undefined) {
    return "offen";
  }

  return formatCurrency(Number(amount));
}

export function formatStatus(status: string) {
  const labels: Record<string, string> = {
    geplant: "Geplant",
    laufend: "Laufend",
    abgeschlossen: "Abgeschlossen",
    storniert: "Storniert",
  };

  return labels[status] ?? status;
}

export function formatGuestType(type: string) {
  const labels: Record<string, string> = {
    standard: "Standard",
    vip: "VIP",
    speaker: "Speaker",
    dienstleister_gast: "Dienstleister-Gast",
  };

  return labels[type] ?? type;
}

export function formatGuestStatus(status: string) {
  const labels: Record<string, string> = {
    angemeldet: "Angemeldet",
    abgesagt: "Abgesagt",
    warteliste: "Warteliste",
    bestaetigt: "Bestätigt",
  };

  return labels[status] ?? status;
}

export function formatProviderCategory(category: string) {
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

export function formatEventProviderStatus(status: string) {
  const labels: Record<string, string> = {
    angefragt: "Angefragt",
    vertrag_offen: "Vertrag offen",
    bestaetigt: "Bestätigt",
    storniert: "Storniert",
    ausgefallen: "Ausgefallen",
  };

  return labels[status] ?? status;
}

export function formatTaskStatus(status: string) {
  const labels: Record<string, string> = {
    offen: "Offen",
    erledigt: "Erledigt",
    ueberfaellig: "Überfällig",
  };

  return labels[status] ?? status;
}

export function formatCommunicationChannel(channel: string) {
  const labels: Record<string, string> = {
    email: "E-Mail",
    whatsapp: "WhatsApp",
    telefon: "Telefon",
    vor_ort: "Vor Ort",
  };

  return labels[channel] ?? channel;
}
