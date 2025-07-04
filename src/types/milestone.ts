export type MilestoneStatus = "TODO" | "DOING" | "PENDING" | "COMPLETED";

export interface Milestone {
  id: number;
  projectFixedPriceId: string;
  projectName: string;
  name: string;
  description: string;
  startDate: string;
  deadlineDate: string;
  status: MilestoneStatus;
  completionDate: string;
  notes: string;
  completionPercentage: number;
}

export interface MilestoneCreateRequest {
  projectFixedPriceId: string;
  name: string;
  description?: string;
  startDate?: string;
  deadlineDate?: string;
  status: MilestoneStatus;
  notes?: string;
  completionDate?: string;
  completionPercentage?: number;
}

export interface MilestoneUpdateRequestData {
  projectFixedPriceId: string;
  name: string;
  description?: string;
  startDate?: string;
  deadlineDate?: string;
  status: MilestoneStatus;
  notes?: string;
  completionDate?: string;
  completionPercentage?: number;
}

export interface MilestoneSummaryDto {
  projectId: string;
  projectName: string;
  totalMilestones: number;
  completedMilestones: number;
  pendingMilestones: number;
  newMilestones: number;
  sentMilestones: number;
  reviewedMilestones: number;
  completionPercentage: number;
  isOnTrack: boolean;
  nextMilestoneDeadline: string;
  nextMilestoneName: string;
  daysUntilNextDeadline: number;
  overdueMilestones: number;
  averageCompletionTime: number;
  milestoneDeliverySuccessRate: number;
  milestonesDeliveredOnTime: number;
  milestonesDeliveredLate: number;
  milestonesByStatus: Record<MilestoneStatus, number>;
  milestonesCompletedThisWeek: number;
  milestonesCompletedThisMonth: number;
  lastMilestoneCompletedDate: string;
}
