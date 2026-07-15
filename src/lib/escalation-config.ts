export const ESCALATION_CONFIG = {
  providerOutage: {
    criticalStatus: "ausgefallen",
    targets: {
      tasks: true,
      currentScheduleItems: true,
    },
  },
} as const;
