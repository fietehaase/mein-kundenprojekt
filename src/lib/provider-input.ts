export const PROVIDER_CATEGORIES = [
  "catering",
  "technik",
  "location",
  "dekoration",
  "moderation",
  "security",
  "sonstige",
] as const;

export type ProviderCategory = (typeof PROVIDER_CATEGORIES)[number];

export type ProviderFormInput = {
  name: string;
  kategorie: string;
  ansprechpartner: string;
  telefonMobil: string;
  email: string;
  zuverlaessigkeitsNotiz: string;
  backupFuerId: string;
};

export type ParsedProviderInput = {
  name: string;
  kategorie: ProviderCategory;
  ansprechpartner: string | null;
  telefonMobil: string | null;
  email: string | null;
  zuverlaessigkeitsNotiz: string | null;
  backupFuerId: number | null;
};

export function parseProviderInput(
  input: ProviderFormInput,
): ParsedProviderInput {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Der Dienstleister-Name ist erforderlich.");
  }

  return {
    name,
    kategorie: parseProviderCategory(input.kategorie),
    ansprechpartner: optionalText(input.ansprechpartner),
    telefonMobil: optionalText(input.telefonMobil),
    email: optionalText(input.email),
    zuverlaessigkeitsNotiz: optionalText(input.zuverlaessigkeitsNotiz),
    backupFuerId: optionalId(input.backupFuerId),
  };
}

export function parseProviderCategory(category: string): ProviderCategory {
  if (PROVIDER_CATEGORIES.includes(category as ProviderCategory)) {
    return category as ProviderCategory;
  }

  throw new Error("Ungueltige Dienstleister-Kategorie.");
}

function optionalText(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue || null;
}

function optionalId(value: string): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const id = Number(trimmedValue);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Backup-Dienstleister ist ungueltig.");
  }

  return id;
}
