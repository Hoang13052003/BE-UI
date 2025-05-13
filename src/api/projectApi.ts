import axiosClient from "./axiosClient";
import { Project } from "../types/project";
import { ProjectRequest } from "../types/ProjectRequest";

export const filterProjects = async (
  criteria: {
    projectName?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  },
  page: number,
  size: number
) => {
  try {
    const params: Record<string, string | number> = {
      page,
      size,
    };

    if (criteria.projectName) {
      params["projectName.contains"] = criteria.projectName;
    }
    if (criteria.status) {
      params["status.contains"] = criteria.status;
    }
    if (criteria.startDate) {
      params["startDate.contains"] = criteria.startDate;
    }
    if (criteria.endDate) {
      params["endDate.contains"] = criteria.endDate;
    }

    const response = await axiosClient.get("api/projects/filters", {
      params,
    });

    const { data, headers } = response;
    const totalCount = headers["x-total-count"];
    const links = headers["x-link"];

    return { users: data, totalCount, links };
  } catch (error) {
    console.error("Error fetching filtered projects:", error);
    throw error;
  }
};

/**
 * Fetches a list of projects.
 * Assumes the endpoint returns an array of Project objects.
 */
export const getProjectsApi = async (): Promise<Project[]> => {
  const { data } = await axiosClient.get("/api/projects");
  return data;
};

/**
 * Creates a new project.
 * @param projectData The data for the new project (matching ProjectRequestDto).
 * Assumes the endpoint returns the created Project object upon success (201 Created).
 */
export const createProjectApi = async (
  projectData: ProjectRequest
): Promise<Project> => {
  const { data } = await axiosClient.post("/api/projects", projectData);
  return data;
};

/**
 * Deletes a project by its ID.
 * @param projectId The ID of the project to delete.
 * Assumes the endpoint returns no content on success (204 No Content).
 */
export const deleteProjectApi = async (projectId: number): Promise<void> => {
  await axiosClient.delete(`/api/projects/${projectId}`);
};

export const getProjectTypesApi = async (): Promise<string[]> => {
  const { data } = await axiosClient.get("/api/enum/project-types");
  return data;
};

export const getProjectStatusesApi = async (): Promise<string[]> => {
  const { data } = await axiosClient.get("/api/enum/project-statuses");
  return data;
};

export const getMilestoneStatusesApi = async (): Promise<string[]> => {
  const { data } = await axiosClient.get("/api/enum/milestone-statuses");
  return data;
};

export const getClientIdByEmailApi = async (email: string): Promise<number> => {
  const { data } = await axiosClient.get(
    `/api/private/user/id-by-email?email=${encodeURIComponent(email)}`
  );
  return data;
};
export interface MilestoneRequest {
  name: string;
  description: string;
  startDate: string;
  deadlineDate: string;
  status: string;
  notes: string;
}
export const addMilestoneToProjectApi = async (
  projectId: number,
  milestoneData: MilestoneRequest
): Promise<void> => {
  await axiosClient.post(
    `/api/projects/${projectId}/milestones`,
    milestoneData
  );
};
