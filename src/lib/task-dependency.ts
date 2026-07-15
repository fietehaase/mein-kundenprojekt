export type TaskDependencyInput = {
  abhaengigVon?: {
    status: string;
  } | null;
};

export function isTaskBlockedByDependency(task: TaskDependencyInput) {
  return Boolean(task.abhaengigVon && task.abhaengigVon.status !== "erledigt");
}

export function canCompleteTask(task: TaskDependencyInput) {
  return !isTaskBlockedByDependency(task);
}
