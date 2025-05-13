import { Project } from "../types/project";
import axiosClient from "./axiosClient";
import { Feedback } from "./feedbackApi";

// export interface Attachment {
//   id: number;
//   projectUpdateId: number;
//   fileName: string;
//   storagePath: string;
//   fileType: string;
//   fileSize: number;
//   uploadedAt: string;
//   createdAt: string;
//   updatedAt: string;
// }

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  onTrackCount: number;
  delayedCount: number;
  atRiskCount: number;
  recentFeedback: Feedback[];
  projectStatus: {
    labels: string[];
    data: number[];
  };
  timeLog: {
    labels: string[];
    data: number[];
  };
}

// API calls for admin dashboard
export const getAdminDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await axiosClient.get("/api/private/admin/dashboards");
  return data;
};

// Projects
export const getAllProjects = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  searchTerm?: string
): Promise<{ projects: Project[]; total: number }> => {
  const params = { page, limit, status, searchTerm };
  const { data } = await axiosClient.get("/api/private/admin/projects", {
    params,
  });
  return data;
};

export const getProjectById = async (id: number): Promise<Project> => {
  const { data } = await axiosClient.get(`/api/private/admin/projects/${id}`);
  return data;
};

// Statistics and Reports
export const getProjectStatistics = async (): Promise<{
  labels: string[];
  data: number[];
}> => {
  const { data } = await axiosClient.get(
    "/api/private/admin/statistics/projects"
  );
  return data;
};

export const getTimeLogStatistics = async (
  period: "daily" | "weekly" | "monthly" = "daily"
): Promise<{
  labels: string[];
  data: number[];
}> => {
  const params = { period };
  const { data } = await axiosClient.get(
    "/api/private/admin/statistics/timelogs",
    { params }
  );
  return data;
};
