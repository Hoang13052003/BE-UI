export type OvertimeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ProjectType = "LABOR" | "FIXED_PRICE";

export interface OvertimeRequest {
  id: number;
  projectId: string;
  projectName: string; // Project name for display
  projectType: ProjectType;
  requestedBy: string;
  requestedByName: string;
  requestedDate: string;
  currentPlannedEndDate: string;
  requestedPlannedEndDate: string;
  reason: string;
  status: OvertimeRequestStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedDate?: string;
  reviewNote?: string;
  createdAt: string;
  createdByName: string;
  updatedAt: string;
  updatedByName: string;
}

export interface CreateOvertimeRequestDto {
  projectId: string;
  projectType: ProjectType;
  requestedPlannedEndDate: string;
  reason: string;
}

export interface ReviewOvertimeRequestDto {
  id: number;
  approved: boolean;
  reviewNote?: string;
}

export interface OvertimeRequestListResponse {
  overtimeRequests: OvertimeRequest[];
  total: number;
} 