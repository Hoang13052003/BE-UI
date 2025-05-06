export type MilestoneStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED'
  | 'CANCELLED';

export interface Milestone {
  id: number;
  title: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null; 
  status: MilestoneStatus | null;
  completionDate: string | null; 
  notes: string | null;
}

