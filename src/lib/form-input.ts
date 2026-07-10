export function optionalText(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue || null;
}

export function optionalId(value: string, label: string): number | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const id = Number(trimmedValue);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`${label} ist ungueltig.`);
  }

  return id;
}

export function requiredDateTime(value: string, label: string): Date {
  if (!value) {
    throw new Error(`${label} ist erforderlich.`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} ist ungueltig.`);
  }

  return date;
}

export function optionalDateTime(value: string, label: string): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} ist ungueltig.`);
  }

  return date;
}

export function optionalDate(value: string, label: string): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${label} ist ungueltig.`);
  }

  return date;
}

export function requiredMoney(value: string, label: string): string {
  const normalizedValue = value.replace(",", ".").trim();
  const numberValue = Number(normalizedValue);

  if (!normalizedValue || Number.isNaN(numberValue) || numberValue < 0) {
    throw new Error(`${label} muss eine Zahl ab 0 sein.`);
  }

  return numberValue.toFixed(2);
}

export function optionalMoney(value: string, label: string): string | null {
  const normalizedValue = value.replace(",", ".").trim();

  if (!normalizedValue) {
    return null;
  }

  const numberValue = Number(normalizedValue);

  if (Number.isNaN(numberValue) || numberValue < 0) {
    throw new Error(`${label} muss eine Zahl ab 0 sein.`);
  }

  return numberValue.toFixed(2);
}
