export interface ProjectUser {
  id: number;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  type: "FIXED_PRICE" | "LABOR";
  status: "NEW" | "PENDING" | "PROGRESS" | "CLOSED";
  startDate: string;
  plannedEndDate: string;
  actualEndDate: string | null;
  totalBudget: number;
  totalActualHours: number;
  totalEstimatedHours: number | null;
  progress: number;
  overallProcess?: number;
  actualProcess?: number;
  users: ProjectUser[];
  totalMilestoneCompleted: number;
  milestoneCount: number;
  newMilestoneCount: number;
  sentMilestoneCount: number;
  reviewedMilestoneCount: number;
  updatedAt: Date;
}

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
}

export interface ProjectDetail {
  id: number;
  name: string;
  description: string | null;
  type: "FIXED_PRICE" | "LABOR";
  status: "NEW" | "PENDING" | "PROGRESS" | "CLOSED";
  startDate: string;
  plannedEndDate: string;
  actualEndDate: string | null;
  totalBudget: number | null;
  totalEstimatedHours: number | null;
  overallProcess?: number;
  actualProcess?: number;
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
