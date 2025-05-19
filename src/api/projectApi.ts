import axiosClient from "./axiosClient";
import { Project } from "../types/project";
import { ProjectRequest } from "../types/ProjectRequest";
import { SortConfig, fetchPaginatedData, PaginatedResult } from './apiUtils';

export interface FetchProjectsResult extends PaginatedResult<Project> {
  projects: Project[]; // Tương thích với code cũ
}

export const fetchProjects = async (
  page: number,
  size: number,
  sortConfig?: SortConfig | SortConfig[]
): Promise<FetchProjectsResult> => {
  try {
    const result = await fetchPaginatedData<Project>('/api/projects', page, size, sortConfig);
    
    // Trả về kết quả theo định dạng cũ để đảm bảo tương thích
    return {
      ...result,
      projects: result.items
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
    startDate?: string;
    endDate?: string;
  },
  page: number,
  size: number
) => {
  try {
    const params: Record<string, string | number> = {};

    if (criteria.name) {
      params["name.contains"] = criteria.name;
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

    const result = await fetchPaginatedData<Project>('api/projects/filters', page, size, undefined, params);
    
    return { 
      projects: result.items, 
      totalCount: result.totalItems, 
      links: result.navigationLinks 
    };
  } catch (error) {
    console.error("Error fetching filtered projects:", error);
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
  type?: "FIXED_PRICE" | "LABOR"; // Sử dụng các giá trị từ type Project
  status?: "NEW" | "PENDING" | "PROGRESS" | "CLOSED"; // Sử dụng các giá trị từ type Project
  startDate?: string;
  plannedEndDate?: string;
  totalBudget?: number;
  totalEstimatedHours?: number;
  userIds?: number[]; // Danh sách id của users, khác với Project.users nên cần định nghĩa riêng
}

export const updateProjectApi = async (
  projectId: number,
  projectData: ProjectUpdateRequest
): Promise<Project> => {
  try {
    const { data } = await axiosClient.put(`/api/projects/${projectId}`, projectData);
    return data;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Project not found');
      } else if (error.response.status === 400) {
        throw new Error(error.response.data.message || 'Invalid project data');
      }
    }
    throw error;
  }
};