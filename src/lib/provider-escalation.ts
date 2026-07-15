export type ProviderEscalationInput = {
  status: string;
  kritisch: boolean;
};

export function triggersProviderOutageEscalation(
  assignment: ProviderEscalationInput,
) {
  return assignment.kritisch && assignment.status === "ausgefallen";
}
