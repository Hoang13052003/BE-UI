//get form api
export interface Project {
  id: number;
  name: string;
  description: string;
  type: "FIXED_PRICE" | "LABOR"; // Updated enum values
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED" | "CANCELLED" | "ON_HOLD"; // Updated enum values
  startDate: string; // Format: "YYYY-MM-DD"
  plannedEndDate: string; // Format: "YYYY-MM-DD"
  actualEndDate: string | null; // Format: "YYYY-MM-DD" (can be null)
  totalBudget: number;
  totalEstimatedHours: number | null; // Updated to allow null based on sample data
  clientId: number;
  clientName: string;
}