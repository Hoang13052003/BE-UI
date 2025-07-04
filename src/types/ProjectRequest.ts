export interface ProjectRequest {
  projectName: string;
  description?: string;
  type: "FIXED_PRICE" | "LABOR";
  status: "NEW" | "PENDING" | "PROGRESS" | "COMPLETED" | "CLOSED";
  startDate?: string;
  plannedEndDate?: string;
  totalBudget?: number;
  totalEstimatedHours?: number | null;
  userIds?: number[];
  isActive?: boolean;
}

// Specific interfaces for each project type
export interface ProjectLaborRequest extends ProjectRequest {
  type: "LABOR";
  totalEstimatedHours: number; // Required for labor projects
}

export interface ProjectFixedPriceRequest extends ProjectRequest {
  type: "FIXED_PRICE";
  totalBudget: number; // Required for fixed price projects
}
