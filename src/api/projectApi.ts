// [File Path: src/services/projectApi.ts]

import axiosClient from "./axiosClient";
import {
  Project,
  ProjectDetail,
  ProjectUpdateTimelineItem,
  ProjectContextTimeLog,
  ApiPage,
} from "../types/project";
import { Milestone } from "../types/milestone";
import { ProjectRequest } from "../types/ProjectRequest";
import {
  SortConfig,
  fetchPaginatedData,
  fetchSpringPageData,
  PaginatedResult,
} from "./apiUtils";
import { User } from "../types/User";

export interface FetchProjectsResult extends PaginatedResult<Project> {
  projects: Project[];
}

export const fetchProjects = async (
  page: number,
  size: number,
  sortConfig?: SortConfig | SortConfig[]
): Promise<FetchProjectsResult> => {
  try {
    const result = await fetchPaginatedData<Project>(
      "/api/projects",
      page,
      size,
      sortConfig
    );
    return {
      ...result,
      projects: result.items,
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const filterProjects = async (
  criteria: {
    name?: string;
    status?: string;
    type?: "FIXED_PRICE" | "LABOR";
    startDate?: string;
    endDate?: string;
  },
  page: number,
  size: number,
  sortConfig?: SortConfig | SortConfig[]
) => {
  try {
    const params: Record<string, string | number> = {};
    if (criteria.name) params["name.contains"] = criteria.name;
    if (criteria.status) params["status.equals"] = criteria.status;
    if (criteria.type) params["type.equals"] = criteria.type;
    if (criteria.startDate) params["startDate.contains"] = criteria.startDate;
    if (criteria.endDate) params["endDate.contains"] = criteria.endDate;

    const result = await fetchPaginatedData<Project>(
      "/api/projects",
      page,
      size,
      sortConfig,
      params
    );
    return {
      projects: result.items,
      totalCount: result.totalItems,
      links: result.navigationLinks,
    };
  } catch (error) {
    console.error("Error fetching filtered projects:", error);
    throw error;
  }
};

export const getProjectByIdApi = async (id: number): Promise<Project> => {
  try {
    const { data } = await axiosClient.get<Project>(`/api/projects/${id}`);
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Project not found") throw error;
      else if (error.message === "Invalid project data") throw error;
    }
    throw error;
  }
};

export const createProjectApi = async (
  projectData: ProjectRequest
): Promise<Project> => {
  const { data } = await axiosClient.post("/api/projects", projectData);
  return data;
};

export const deleteProjectApi = async (projectId: number): Promise<void> => {
  await axiosClient.delete(`/api/projects/${projectId}`);
};

export interface MilestoneRequest {
  name: string;
  description: string;
  startDate: string;
  deadlineDate: string;
  status: string;
  notes: string;
  completionPercentage?: number;
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

export interface ProjectUpdateRequest {
  name?: string;
  description?: string;
  type?: "FIXED_PRICE" | "LABOR";
  status?: "NEW" | "PENDING" | "PROGRESS" | "CLOSED";
  startDate?: string;
  plannedEndDate?: string;
  totalBudget?: number;
  totalEstimatedHours?: number;
  userIds?: number[];
}

export const updateProjectApi = async (
  projectId: number,
  projectData: ProjectUpdateRequest
): Promise<Project> => {
  try {
    const { data } = await axiosClient.put(
      `/api/projects/${projectId}`,
      projectData
    );
    return data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) throw new Error("Project not found");
      else if (error.response.status === 400) {
        const errorMessage =
          error.response.data.message || "Invalid project data";
        if (
          errorMessage.includes(
            "Planned end date must be in the present or future"
          )
        ) {
          console.warn(
            "Backend validation for planned end date has been skipped"
          );
          return { ...projectData, id: projectId } as Project;
        }
        throw new Error(errorMessage);
      }
    }
    throw error;
  }
};

export const getProjectDetailsApi = async (
  projectId: number
): Promise<ProjectDetail> => {
  try {
    const { data } = await axiosClient.get<ProjectDetail>(
      `/api/projects/${projectId}/details`
    );
    return data;
  } catch (error) {
    console.error(`Error fetching project details for ID ${projectId}:`, error);
    throw error;
  }
};

export const getProjectUpdatesTimelineApi = async (
  projectId: number,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[]
): Promise<ApiPage<ProjectUpdateTimelineItem>> => {
  try {
    const defaultSort: SortConfig[] = [
      { property: "updateDate", direction: "desc" },
    ];
    const currentSortConfig = sortConfig
      ? Array.isArray(sortConfig)
        ? sortConfig
        : [sortConfig]
      : defaultSort;

    const result = await fetchSpringPageData<ProjectUpdateTimelineItem>(
      `/api/projects/${projectId}/updates-timeline`,
      page,
      size,
      currentSortConfig
    );
    return result;
  } catch (error) {
    console.error(
      `Error fetching project updates timeline for project ID ${projectId}:`,
      error
    );
    const defaultSortInfo = { sorted: false, unsorted: true, empty: true };
    const defaultPageable = {
      pageNumber: page,
      pageSize: size,
      offset: page * size,
      paged: true,
      unpaged: false,
      sort: defaultSortInfo,
    };
    return {
      content: [],
      pageable: defaultPageable,
      last: true,
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      sort: defaultSortInfo,
      first: true,
      numberOfElements: 0,
      empty: true,
    } as ApiPage<ProjectUpdateTimelineItem>;
  }
};

export const getProjectMilestonesOverviewApi = async (
  projectId: number,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[],
  filterParams?: Record<string, any>
): Promise<ApiPage<Milestone>> => {
  try {
    const defaultSort: SortConfig[] = [
      { property: "deadlineDate", direction: "asc" },
    ];
    const currentSortConfig = sortConfig
      ? Array.isArray(sortConfig)
        ? sortConfig
        : [sortConfig]
      : defaultSort;

    const result = await fetchSpringPageData<Milestone>(
      `/api/projects/${projectId}/milestones-overview`,
      page,
      size,
      currentSortConfig,
      filterParams
    );
    return result;
  } catch (error) {
    console.error(
      `Error fetching project milestones overview for project ID ${projectId}:`,
      error
    );
    const defaultSortInfo = { sorted: false, unsorted: true, empty: true };
    const defaultPageable = {
      pageNumber: page,
      pageSize: size,
      offset: page * size,
      paged: true,
      unpaged: false,
      sort: defaultSortInfo,
    };
    return {
      content: [],
      pageable: defaultPageable,
      last: true,
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      sort: defaultSortInfo,
      first: true,
      numberOfElements: 0,
      empty: true,
    } as ApiPage<Milestone>;
  }
};

export const getProjectTimeLogsListApi = async (
  projectId: number,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[],
  startDate?: string,
  endDate?: string
): Promise<ApiPage<ProjectContextTimeLog>> => {
  try {
    const defaultSort: SortConfig[] = [
      { property: "taskDate", direction: "desc" },
    ];
    const currentSortConfig = sortConfig
      ? Array.isArray(sortConfig)
        ? sortConfig
        : [sortConfig]
      : defaultSort;

    const apiUrl = `/api/projects/${projectId}/timelogs-list`;

    // Prepare additional query params for date filtering
    const additionalParams: Record<string, any> = {};
    if (startDate) additionalParams.startDate = startDate;
    if (endDate) additionalParams.endDate = endDate;
    const result = await fetchSpringPageData<ProjectContextTimeLog>(
      apiUrl,
      page,
      size,
      currentSortConfig,
      additionalParams
    );
    return result;
  } catch (error) {
    console.error(
      `Error fetching project time logs list for project ID ${projectId}:`,
      error
    );
    const defaultSortInfo = { sorted: false, unsorted: true, empty: true };
    const defaultPageable = {
      pageNumber: page,
      pageSize: size,
      offset: page * size,
      paged: true,
      unpaged: false,
      sort: defaultSortInfo,
    };
    return {
      content: [],
      pageable: defaultPageable,
      last: true,
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      sort: defaultSortInfo,
      first: true,
      numberOfElements: 0,
      empty: true,
    } as ApiPage<ProjectContextTimeLog>;
  }
};

export const getUsersByProjectId = async (
  projectId: number
): Promise<User[]> => {
  const response = await axiosClient.get(`/api/projects/${projectId}/users`);
  return response.data;
};
