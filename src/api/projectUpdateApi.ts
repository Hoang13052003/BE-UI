// src/api/projectUpdateApi.ts
import axiosClient from "./axiosClient";
import { SortConfig, fetchPaginatedData, PaginatedResult } from "./apiUtils";

// Project Update Types
export interface ProjectUpdate {
  id: number;
  projectId: number;
  projectName: string;
  projectType: string;
  userId: number;
  email: string;
  updateDate: string;
  summary: string;
  details: string;
  statusAtUpdate: string;
  completionPercentage: number;
  createdByUserId: number;
  createdByName: string;
  published: boolean;
  internalNotes: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: number;
  projectUpdateId: number;
  fileName: string;
  storagePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUpdateRequest {
  projectId: number;
  updateDate: string;
  summary: string;
  details: string;
  statusAtUpdate: string;
  completionPercentage: number;
  published: boolean;
  internalNotes?: string;
}

export interface ProjectUpdateEditRequest
  extends Partial<ProjectUpdateRequest> {
  id: number;
}

export interface ProjectUpdateFetchResult
  extends PaginatedResult<ProjectUpdate> {
  updates: ProjectUpdate[];
}

// Get updates for a specific project
export const getProjectUpdatesApi = async (
  projectId: number,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[]
): Promise<ProjectUpdateFetchResult> => {
  try {
    const result = await fetchPaginatedData<ProjectUpdate>(
      `/api/private/admin/${projectId}/updates`,
      page,
      size,
      sortConfig
    );

    return {
      ...result,
      updates: result.items.content,
    };
  } catch (error) {
    console.error("Error fetching project updates:", error);
    throw error;
  }
};

// Get all updates (admin only)
export const getAllProjectUpdatesApi = async (
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[],
  filters?: Record<string, any>
): Promise<ProjectUpdateFetchResult> => {
  try {
    const result = await fetchPaginatedData<ProjectUpdate>(
      "/api/private/admin/project-updates",
      page,
      size,
      sortConfig,
      filters
    );

    console.log("Data: " + JSON.stringify(result));

    return {
      ...result,
      updates: result.items.content,
    };
  } catch (error) {
    console.error("Error fetching all project updates:", error);
    throw error;
  }
};

// Get a specific update by ID
export const getProjectUpdateByIdApi = async (
  updateId: number
): Promise<ProjectUpdate> => {
  try {
    const { data } = await axiosClient.get(
      `api/private/admin/project-updates/${updateId}`
    );
    return data;
  } catch (error) {
    console.error(`Error fetching project update with ID ${updateId}:`, error);
    throw error;
  }
};

// Create a new project update
export const createProjectUpdateApi = async (
  updateData: ProjectUpdateRequest
): Promise<ProjectUpdate> => {
  try {
    console.log("data request: " + updateData);

    const { data } = await axiosClient.post(
      "api/private/admin/project-updates",
      updateData
    );
    return data;
  } catch (error) {
    console.error("Error creating project update:", error);
    throw error;
  }
};

// Update an existing project update
export const updateProjectUpdateApi = async (
  updateId: number,
  updateData: Partial<ProjectUpdateRequest>
): Promise<ProjectUpdate> => {
  try {
    const { data } = await axiosClient.patch(
      `api/private/admin/project-updates/${updateId}`,
      updateData
    );
    return data;
  } catch (error) {
    console.error(`Error updating project update with ID ${updateId}:`, error);
    throw error;
  }
};

// Delete a project update
export const deleteProjectUpdateApi = async (
  updateId: number
): Promise<void> => {
  try {
    await axiosClient.delete(`api/private/admin/project-updates/${updateId}`);
  } catch (error) {
    console.error(`Error deleting project update with ID ${updateId}:`, error);
    throw error;
  }
};

// Upload attachment for a project update
export const uploadAttachmentApi = async (
  projectUpdateId: number,
  file: File
): Promise<Attachment> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosClient.post(
      `/api/project-updates/${projectUpdateId}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  } catch (error) {
    console.error(
      `Error uploading attachment for project update ${projectUpdateId}:`,
      error
    );
    throw error;
  }
};

// Delete attachment
export const deleteAttachmentApi = async (
  attachmentId: number
): Promise<void> => {
  try {
    await axiosClient.delete(`/api/attachments/${attachmentId}`);
  } catch (error) {
    console.error(`Error deleting attachment with ID ${attachmentId}:`, error);
    throw error;
  }
};

// Get project statuses (for dropdown options)
export const getProjectStatusesApi = async (): Promise<string[]> => {
  try {
    const { data } = await axiosClient.get(
      "api/private/admin/project-statuses"
    );
    return data;
  } catch (error) {
    console.error("Error fetching project statuses:", error);
    // Return default statuses if API fails
    return ["NEW", "PENDING", "PROGRESS", "AT_RISK", "COMPLETED", "CLOSED"];
  }
};
