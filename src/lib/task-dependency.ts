export type TaskDependencyInput = {
  abhaengigVon?: {
    status: string;
  } | null;
};

export type TaskDependencyScopeInput = {
  eventId: number;
  abhaengigVon?: {
    eventId: number;
  } | null;
};

export function isTaskBlockedByDependency(task: TaskDependencyInput) {
  return Boolean(task.abhaengigVon && task.abhaengigVon.status !== "erledigt");
}

export function canCompleteTask(task: TaskDependencyInput) {
  return !isTaskBlockedByDependency(task);
}

export function isTaskDependencyInSameEvent(task: TaskDependencyScopeInput) {
  return !task.abhaengigVon || task.abhaengigVon.eventId === task.eventId;
}
