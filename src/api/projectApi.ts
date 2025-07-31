// [File Path: src/services/projectApi.ts]

import axiosClient from "./axiosClient";
import {
  Project,
  ProjectDetail,
  ProjectUpdateTimelineItem,
  ProjectContextTimeLog,
  ApiPage,
  ProjectFixedPriceDetailsResponse,
} from "../types/project";
import { ProjectRequest } from "../types/ProjectRequest";
import { SortConfig, fetchSpringPageData, PaginatedResult } from "./apiUtils";
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
    let sort: string[] = [];
    if (Array.isArray(sortConfig)) {
      sort = sortConfig.map((sCfg) => `${sCfg.property},${sCfg.direction}`);
    } else if (sortConfig) {
      sort = [`${sortConfig.property},${sortConfig.direction}`];
    }

    const params = {
      page,
      size,
      ...(sort.length > 0 ? { sort } : {}),
    };

    const response = await axiosClient.get(
      "/api/private/unified-projects/search",
      {
        params,
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, v));
            } else if (value !== undefined && value !== null) {
              searchParams.append(key, String(value));
            }
          });
          return searchParams.toString();
        },
      }
    );

    // Handle new response structure
    const responseData = response.data;
    const projects = responseData.projects || [];
    const totalItems = responseData.totalProjects || 0;

    return {
      items: normalizeProjectsData(projects),
      projects: normalizeProjectsData(projects),
      totalItems,
      navigationLinks: {}, // No navigation links in new response
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
    projectType?: "FIXED_PRICE" | "LABOR";
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    minBudget?: number;
    maxBudget?: number;
    minProgress?: number;
    maxProgress?: number;
    isOverdue?: boolean;
    isCompleted?: boolean;
  },
  page: number,
  size: number,
  sortConfig?: SortConfig | SortConfig[]
) => {
  try {
    let sort: string[] = [];
    if (Array.isArray(sortConfig)) {
      sort = sortConfig.map((sCfg) => `${sCfg.property},${sCfg.direction}`);
    } else if (sortConfig) {
      sort = [`${sortConfig.property},${sortConfig.direction}`];
    }

    const params: Record<string, any> = {
      page,
      size,
      ...(sort.length > 0 ? { sort } : {}),
    };

    // Map criteria to new API parameters
    if (criteria.name) params.name = criteria.name;
    if (criteria.status) params.status = criteria.status;
    if (criteria.projectType) params.projectType = criteria.projectType;
    if (criteria.startDateFrom) params.startDateFrom = criteria.startDateFrom;
    if (criteria.startDateTo) params.startDateTo = criteria.startDateTo;
    if (criteria.endDateFrom) params.endDateFrom = criteria.endDateFrom;
    if (criteria.endDateTo) params.endDateTo = criteria.endDateTo;
    if (criteria.minBudget !== undefined) params.minBudget = criteria.minBudget;
    if (criteria.maxBudget !== undefined) params.maxBudget = criteria.maxBudget;
    if (criteria.minProgress !== undefined)
      params.minProgress = criteria.minProgress;
    if (criteria.maxProgress !== undefined)
      params.maxProgress = criteria.maxProgress;
    if (criteria.isOverdue !== undefined) params.isOverdue = criteria.isOverdue;
    if (criteria.isCompleted !== undefined)
      params.isCompleted = criteria.isCompleted;

    const response = await axiosClient.get(
      "/api/private/unified-projects/search",
      {
        params,
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(key, v));
            } else if (value !== undefined && value !== null) {
              searchParams.append(key, String(value));
            }
          });
          return searchParams.toString();
        },
      }
    );

    // Handle new response structure from tutorial.md
    const responseData = response.data;
    const projects = responseData.projects || [];
    const totalProjects = responseData.totalProjects || 0;

    return {
      projects: normalizeProjectsData(projects),
      totalCount: totalProjects,
      laborProjectsCount: responseData.laborProjectsCount || 0,
      fixedPriceProjectsCount: responseData.fixedPriceProjectsCount || 0,
      links: {}, // No navigation links in new response
    };
  } catch (error) {
    console.error("Error fetching filtered projects:", error);
    throw error;
  }
};

export const getProjectByIdApi = async (id: number): Promise<Project> => {
  try {
    const { data } = await axiosClient.get<any>(`/api/projects/${id}`);
    return normalizeProjectData(data);
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
  // Validate required fields based on project type
  if (projectData.type === "LABOR") {
    if (
      !projectData.totalEstimatedHours ||
      projectData.totalEstimatedHours <= 0
    ) {
      throw new Error(
        "Total estimated hours is required and must be greater than 0 for labor projects"
      );
    }
  } else if (projectData.type === "FIXED_PRICE") {
    if (!projectData.totalBudget || projectData.totalBudget <= 0) {
      throw new Error(
        "Total budget is required and must be greater than 0 for fixed price projects"
      );
    }
  }

  // Validate project name
  if (!projectData.projectName || projectData.projectName.trim().length === 0) {
    throw new Error("Project name is required");
  }

  if (projectData.projectName.length > 200) {
    throw new Error(
      "Project name must be less than or equal to 200 characters"
    );
  }

  // Validate description length
  if (projectData.description && projectData.description.length > 65535) {
    throw new Error("Description is too long");
  }

  // Validate dates
  if (projectData.plannedEndDate) {
    const plannedEndDate = new Date(projectData.plannedEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison

    if (plannedEndDate < today) {
      throw new Error("Planned end date must be in the present or future");
    }
  }

  // Determine the correct endpoint based on project type
  const endpoint =
    projectData.type === "LABOR"
      ? "/api/projects/labor"
      : "/api/projects/fixed-price";

  // Remove type field from request body as it's only used for endpoint selection
  // Set isActive to true by default if not provided
  const { type, ...requestData } = {
    ...projectData,
    isActive: projectData.isActive ?? true,
  };

  const { data } = await axiosClient.post(endpoint, requestData);
  return normalizeProjectData(data);
};

// Delete project using specific endpoints based on project type
// DELETE /api/projects/labor/{id} - Delete labor project
export const deleteProjectLaborApi = async (
  projectId: string,
  force: boolean = false
): Promise<void> => {
  await axiosClient.delete(`/api/projects/labor/${projectId}`, {
    params: force ? { force: true } : undefined,
  });
};

// DELETE /api/projects/fixed-price/{id} - Delete fixed price project
export const deleteProjectFixedPriceApi = async (
  projectId: string,
  force: boolean = false
): Promise<void> => {
  await axiosClient.delete(`/api/projects/fixed-price/${projectId}`, {
    params: force ? { force: true } : undefined,
  });
};

// Helper function to delete project based on its type
// Automatically routes to the correct endpoint based on project type
export const deleteProjectByTypeApi = async (
  projectId: string,
  projectType: "LABOR" | "FIXED_PRICE",
  force: boolean = false
): Promise<void> => {
  if (projectType === "LABOR") {
    await deleteProjectLaborApi(projectId, force);
  } else if (projectType === "FIXED_PRICE") {
    await deleteProjectFixedPriceApi(projectId, force);
  } else {
    throw new Error(`Unsupported project type: ${projectType}`);
  }
};

export interface ProjectUpdateRequest {
  projectName?: string;
  description?: string;
  projectType?: "FIXED_PRICE" | "LABOR";
  status?: "NEW" | "PENDING" | "PROGRESS" | "COMPLETED" | "CLOSED";
  startDate?: string;
  plannedEndDate?: string;
  totalBudget?: number;
  totalEstimatedHours?: number;
  userIds?: number[];
}

export interface ProjectLaborUpdateRequest {
  projectName?: string;
  description?: string;
  status?: "NEW" | "PENDING" | "PROGRESS" | "COMPLETED" | "CLOSED";
  startDate?: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  totalBudget?: number;
  totalEstimatedHours?: number;
  userIds?: number[];
  type?: "LABOR" | "FIXED_PRICE";
}

export interface ProjectFixedPriceUpdateRequest {
  name?: string;
  description?: string;
  status?: "NEW" | "PENDING" | "PROGRESS" | "COMPLETED" | "CLOSED";
  startDate?: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  totalBudget?: number;
  completionPercentage?: number;
  userIds?: number[];
  isActive?: boolean;
  type?: "LABOR" | "FIXED_PRICE";
}

export const updateProjectApi = async (
  projectId: string,
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
          // Return the response data directly instead of casting
          throw new Error(errorMessage);
        }
        throw new Error(errorMessage);
      }
    }
    throw error;
  }
};

export const updateProjectLaborApi = async (
  projectId: string,
  projectData: ProjectLaborUpdateRequest
): Promise<Project> => {
  try {
    const { data } = await axiosClient.put(
      `/api/projects/labor/${projectId}`,
      projectData
    );
    return data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) throw new Error("Project not found");
      else if (error.response.status === 400) {
        const errorMessage =
          error.response.data.message || "Invalid project data";
        throw new Error(errorMessage);
      }
    }
    throw error;
  }
};

export const updateProjectFixedPriceApi = async (
  projectId: string,
  projectData: ProjectFixedPriceUpdateRequest
): Promise<Project> => {
  try {
    const { data } = await axiosClient.put(
      `/api/projects/fixed-price/${projectId}`,
      projectData
    );
    return normalizeProjectData(data);
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) throw new Error("Project not found");
      else if (error.response.status === 400) {
        const errorMessage =
          error.response.data.message || "Invalid project data";
        throw new Error(errorMessage);
      }
    }
    throw error;
  }
};

// Legacy project details API (old endpoint)
export const getProjectLaborDetailsApi = async (
  projectId: string
): Promise<ProjectDetail> => {
  try {
    const { data } = await axiosClient.get<ProjectDetail>(
      `/api/projects/labor/${projectId}/details`
    );
    return data;
  } catch (error) {
    console.error(`Error fetching project details for ID ${projectId}:`, error);
    throw error;
  }
};

// New project fixed price details API (from tutorial)
export const getProjectFixedPriceDetailsApi = async (
  projectId: string
): Promise<ProjectFixedPriceDetailsResponse> => {
  try {
    const { data } = await axiosClient.get<ProjectFixedPriceDetailsResponse>(
      `/api/projects/fixed-price/${projectId}/details`
    );
    return data;
  } catch (error) {
    console.error(
      `Error fetching fixed price project details for ID ${projectId}:`,
      error
    );
    throw error;
  }
};

export const getProjectUpdatesTimelineApi = async (
  projectId: string,
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

export const getProjectTimeLogsListApi = async (
  projectId: string,
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

export const getUsersByProjectFixedPriceId = async (
  projectId: string
): Promise<User[]> => {
  const response = await axiosClient.get(
    `/api/projects/fixed-price/${projectId}/users`
  );
  return response.data;
};

export const getUsersByProjectLaborId = async (
  projectId: string
): Promise<User[]> => {
  const response = await axiosClient.get(
    `/api/projects/labor/${projectId}/users`
  );
  return response.data;
};
const normalizeProjectData = (project: any): Project => {
  return {
    ...project,
    type: project.projectType,
  };
};

const normalizeProjectsData = (projects: any[]): Project[] => {
  return projects.map(normalizeProjectData);
};
