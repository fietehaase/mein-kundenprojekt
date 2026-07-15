import { ESCALATION_CONFIG } from "./escalation-config";

export type ProviderEscalationInput = {
  status: string;
  kritisch: boolean;
};

export function triggersProviderOutageEscalation(
  assignment: ProviderEscalationInput,
) {
  return (
    assignment.kritisch &&
    assignment.status === ESCALATION_CONFIG.providerOutage.criticalStatus
  );
}
