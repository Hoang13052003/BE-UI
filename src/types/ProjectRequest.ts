//send to api
export interface ProjectRequest {
  name: string;
  description: string;
  type: "FIXED_PRICE" | "LABOR"; // Updated enum values
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED" | "CANCELLED" | "ON_HOLD"; // Updated enum values
  startDate: string; // Format: "YYYY-MM-DD"
  plannedEndDate: string; // Format: "YYYY-MM-DD"
  totalBudget: number;
  totalEstimatedHours: number | null; // Assuming this can also be null on creation/update
  clientId: number; // Assuming you need the client ID to associate the project
  // Add any other fields required by your ProjectRequestDto
}