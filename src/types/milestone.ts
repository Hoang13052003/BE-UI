export type MilestoneStatus = "NEW" | "SENT" | "REVIEWED";

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
