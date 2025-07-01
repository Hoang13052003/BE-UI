export interface ProjectUser {
  id: number;
  email: string;
}

export interface Project {
  id: string; // Changed to string to match backend UUID
  name: string;
  description: string;
  projectType: "LABOR" | "FIXED_PRICE";
  status: "NEW" | "PENDING" | "PROGRESS" | "COMPLETED" | "CLOSED";
  startDate: string;
  plannedEndDate: string;
  actualEndDate: string | null;
  totalBudget: number;
  totalEstimatedHours: number | null;
  overallProcess: number;
  actualProcess: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  completed: boolean;
  overdue: boolean;
  laborProject: boolean;
  fixedPriceProject: boolean;
  // Optional fields for compatibility
  totalActualHours?: number;
  progress?: number;
  users?: ProjectUser[];
  totalMilestoneCompleted?: number;
  milestoneCount?: number;
  newMilestoneCount?: number;
  sentMilestoneCount?: number;
  reviewedMilestoneCount?: number;
}

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
}

export interface ProjectDetail {
  id: string; // Changed to string for UUID
  name: string;
  description: string | null;
  projectType: "LABOR" | "FIXED_PRICE";
  status: "NEW" | "PENDING" | "PROGRESS" | "COMPLETED" | "CLOSED";
  startDate: string;
  plannedEndDate: string;
  actualEndDate: string | null;
  totalBudget: number | null;
  totalEstimatedHours: number | null;
  overallProcess?: number;
  actualProcess?: number;
  laborProject: boolean;
  fixedPriceProject: boolean;
  users: UserSummary[];
}

export interface ProjectUpdateTimelineItem {
  id: number;
  createdBy: UserSummary;
  updateDate: string;
  summary: string | null;
  details: string | null;
  statusAtUpdate: string | null;
  completionPercentage: number | null;
  published: boolean;
}

export interface ProjectContextTimeLog {
  id: number;
  performer: UserSummary;
  taskDate: string;
  taskDescription: string;
  hoursSpent: number;
}

export interface SortInfo {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface PageableInfo {
  sort: SortInfo;
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

export interface ApiPage<T> {
  content: T[];
  pageable: PageableInfo;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: SortInfo;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
