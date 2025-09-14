
export enum PlanStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
}

export interface PlanItem {
  id: string;
  title: string;
  description: string;
  status: PlanStatus;
}
