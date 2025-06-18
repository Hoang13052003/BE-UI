export interface ProjectRequest {
  name: string;
  description: string;
  type: "FIXED_PRICE" | "LABOR";
  status: "NEW" | "PENDING" | "PROGRESS" | "CLOSED";
  startDate: string;
  plannedEndDate: string;
  totalBudget: number;
  totalEstimatedHours: number | null;
  userIds: number[];
}
