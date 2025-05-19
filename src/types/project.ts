//get form api
export interface ProjectUser {
  id: number;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  type: "FIXED_PRICE" | "LABOR"; // Updated enum values
  status: "NEW" | "PENDING" | "PROGRESS" | "CLOSED"; // Updated enum values
  startDate: string; // Format: "YYYY-MM-DD"
  plannedEndDate: string; // Format: "YYYY-MM-DD"
  actualEndDate: string | null; // Format: "YYYY-MM-DD" (can be null)
  totalBudget: number;
  totalEstimatedHours: number | null; // Updated to allow null based on sample data
  progress: number;
  users: ProjectUser[]; // List of users assigned to the project
  milestoneCount: number;
  newMilestoneCount: number;      
  sentMilestoneCount: number;     
  reviewedMilestoneCount: number; 
}
