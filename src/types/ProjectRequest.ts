//send to api
export interface ProjectRequest {
  name: string;
  description: string;
  type: "FIXED_PRICE" | "LABOR"; // Updated enum values
  status: "NEW" | "PENDING" | "PROGRESS" | "CLOSED"; // Updated enum values
  startDate: string; // Format: "YYYY-MM-DD"
  plannedEndDate: string; // Format: "YYYY-MM-DD"
  totalBudget: number;
  totalEstimatedHours: number | null; // Assuming this can also be null on creation/update
  userIds: number[]; // List of user IDs assigned to the project
}