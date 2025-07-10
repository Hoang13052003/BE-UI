export type OvertimeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ProjectType = "LABOR" | "FIXED_PRICE";

export interface OvertimeRequest {
  id: number;
  projectId: string;
  projectType: ProjectType;
  requestedBy: string;
  requestedDate: string;
  currentPlannedEndDate: string;
  requestedPlannedEndDate: string;
  reason: string;
  status: OvertimeRequestStatus;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewNote?: string;
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