export type BindingCommunicationInput = {
  istVerbindlich: boolean;
};

export function isBindingCommunication(
  communication: BindingCommunicationInput,
) {
  return communication.istVerbindlich;
}

export function filterBindingCommunications<T extends BindingCommunicationInput>(
  communications: T[],
) {
  return communications.filter(isBindingCommunication);
}
