export type MilestoneStatus = "TODO" | "DOING" | "PENDING" | "COMPLETED";

export interface Milestone {
  id: number;
  name: string | null;
  description: string | null;
  startDate: string | null;
  deadlineDate: string | null;
  status: MilestoneStatus | null;
  completionDate: string | null;
  notes: string | null;
  completed?: boolean;
  completionPercentage?: number;
}
export interface MilestoneUpdateRequestData {
  name?: string;
  description?: string;
  startDate?: string | null;
  deadlineDate?: string | null;
  completionDate?: string | null;
  status?: MilestoneStatus;
  notes?: string;
  completionPercentage?: number;
}
