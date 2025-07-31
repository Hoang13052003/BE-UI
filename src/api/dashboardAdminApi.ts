import { Project } from "../types/project";
import axiosClient from "./axiosClient";

export interface DashboardStatus {
  labels: string[];
  data: number[];
}

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  onTrackCount: number;
  delayedCount: number;
  atRiskCount: number;
  projectStatus: {
    labels: string[];
    data: number[];
  };
}

export interface DashboardSummaryFull extends DashboardSummary {
  projectStatusWeek?: DashboardStatus;
  projectStatusMonth?: DashboardStatus;
  projectStatusQuarter?: DashboardStatus;
}

export const getAdminDashboardSummary =
  async (): Promise<DashboardSummaryFull> => {
    const { data } = await axiosClient.get("/api/private/admin/dashboards");
    return data;
  };

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
