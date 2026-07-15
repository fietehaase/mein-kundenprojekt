export function shouldCreateInitialCurrentSchedule(hasCurrentPlan: boolean) {
  return !hasCurrentPlan;
}

export function nextScheduleVersion(currentLatestVersion: number | null) {
  return currentLatestVersion === null ? 1 : currentLatestVersion + 1;
}
