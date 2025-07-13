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
  id: string;
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

// New types for Project Fixed Price Details API (from tutorial)
export interface UserBasicResponseDto {
  id: number;
  email: string;
  fullName: string;
  image: string | null;
  note: string | null;
  role: string;
}

export interface MilestoneResponseDto {
  id: number;
  projectFixedPriceId: string;
  projectName: string;
  name: string;
  description: string | null;
  startDate: string | null;
  deadlineDate: string | null;
  status: "TODO" | "DOING" | "PENDING" | "COMPLETED";
  completionDate: string | null;
  notes: string | null;
  completionPercentage: number;
}

export interface UserSummaryDto {
  id: number;
  fullName: string;
  email: string;
}

export interface ProjectUpdateTimelineDto {
  id: number;
  createdBy: UserSummaryDto;
  updateDate: string;
  summary: string;
  details: string | null;
  statusAtUpdate: "NEW" | "SENT" | "FEEDBACK";
  overallProcess: number | null;
  actualProcess: number | null;
  published: boolean;
}

export interface ProjectFixedPriceDetailsResponse {
  id: string;
  name: string;
  description: string | null;
  status: "NEW" | "PENDING" | "PROGRESS" | "COMPLETED" | "CLOSED";
  startDate: string | null;
  plannedEndDate: string | null;
  actualEndDate: string | null;
  totalBudget: number | null;
  completionPercentage: number;
  overallProcess: number | null;
  actualProcess: number | null;
  isActive: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  users: UserBasicResponseDto[];
  milestoneInWeek: MilestoneResponseDto[];
  projectUpdates: ProjectUpdateTimelineDto[];
  totalMilestoneCount: number;
  totalProjectUpdateCount: number;
  activeUserCount: number;
  newMilestones: number;
  sentMilestones: number;
  reviewedMilestones: number;
  completedMilestones: number;
  daysUntilDeadline: number | null;
  isOverdue: boolean | null;
  averageMilestoneCompletionDays: number | null;
  milestonesCompletedThisWeek: number;
}

export interface ProjectLaborDetailResponse {
  id: string;
  projectName: string;
  description: string | null;
  status: "NEW" | "PENDING" | "PROGRESS" | "COMPLETED" | "CLOSED";
  startDate: string | null;
  plannedEndDate: string | null;
  actualEndDate: string | null;
  totalBudget: number | null;
  totalActualHours: number | null;
  totalEstimatedHours: number | null;
  completionPercentage: number | null;
  overallProcess: number | null;
  actualProcess: number | null;
  isActive: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  users: UserBasicResponseDto[];
  recentTimeLogs: TimeLogResponseDto[];
  projectUpdates: ProjectUpdateTimelineDto[];
  totalTimeLogCount: number;
  totalProjectUpdateCount: number;
  participantCount: number;
  remainingHours: number | null;
  daysUntilDeadline: number | null;
}

export interface TimeLogResponseDto {
  id: number;
  performer: UserSummaryDto;
  taskDate: string;
  taskDescription: string;
  hoursSpent: number;
  computedTimelogStatus?: string;
  completionPercentage?: number;
}

// Add new interface for Project Update History
export interface ProjectUpdateHistoryItem {
  id: number;
  projectLaborId: string;
  projectName: string;
  performerId: number;
  performerFullName: string;
  taskDate: string;
  taskDescription: string;
  hoursSpent: number;
  createdAt: string;
  computedTimelogStatus: string;
  actualTimelogStatus: string;
  completionPercentage: number;
}

// Add new interface for Fixed Price Project Update History (Milestone data)
export interface ProjectUpdateHistoryMilestoneItem {
  id: number;
  projectFixedPriceId: string;
  projectName: string;
  name: string;
  description: string;
  startDate: string;
  deadlineDate: string;
  status: string;
  completionDate: string | null;
  notes: string | null;
  completionPercentage: number;
}
