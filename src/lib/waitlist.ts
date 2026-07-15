import type { GuestStatus } from "./guest-input";

export const ACTIVE_GUEST_STATUSES: GuestStatus[] = [
  "angemeldet",
  "bestaetigt",
];

export function isActiveGuestStatus(status: string) {
  return ACTIVE_GUEST_STATUSES.includes(status as GuestStatus);
}

export function resolveGuestStatusForCapacity(
  requestedStatus: GuestStatus,
  plannedGuests: number,
  activeGuests: number,
): GuestStatus {
  if (!isActiveGuestStatus(requestedStatus)) {
    return requestedStatus;
  }

  return activeGuests >= plannedGuests ? "warteliste" : requestedStatus;
}
