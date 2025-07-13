// src/api/projectUpdateApi.ts
import axiosClient from "./axiosClient";
import { SortConfig, fetchSpringPageData } from "./apiUtils";
import { ApiPage } from "../types/project";
import { getProjectLaborDetailsApi, getProjectFixedPriceDetailsApi } from "./projectApi";

// Project Update Types
export interface ProjectUpdate {
  id: number;
  projectId: string;
  projectName: string;
  projectType: string;
  userId: number;
  email: string;
  updateDate: string;
  summary: string | null;
  details: string | null;
  statusAtUpdate: string;
  overallProcess?: number;
  actualProcess?: number;
  historyKey?: string;
  createdByName?: string;

  published: boolean;
  internalNotes: string | null;
  attachments?: Attachment[];
  createdAt?: string;
  updatedAt?: string;
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

export interface ProjectUpdateRequestPayload {
  projectId: string;
  updateDate: string;
  summary: string;
  details: string;
  statusAtUpdate: string;
  overallProcess: number;
  actualProcess: number;
  published: boolean;
  internalNotes?: string;
}

export enum UpdateStatusEnum {
  NEW = "NEW",
  SENT = "SENT",
  FEEDBACK = "FEEDBACK",
}

export interface ProjectUpdateEditRequest
  extends Partial<ProjectUpdateRequestPayload> {
  id: number;
}

// Remove ProjectUpdateFetchResult if no API uses it
// export interface ProjectUpdateFetchResult extends PaginatedResult<ProjectUpdate> {
//   updates: ProjectUpdate[];
// }

// Function getProjectUpdatesApi (get updates for a specific project)
// If API `/api/private/admin/${projectId}/updates` also returns Spring Page,
// you should call fetchSpringPageData for it.
// Currently, I suppose it still uses fetchPaginatedData (old) if you don't want to change.
// If you want to change, do similarly to getAllProjectUpdatesApi.
/*
export const getProjectUpdatesApi = async (
  projectId: string,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[]
): Promise<ProjectUpdateFetchResult> => { // OR Promise<ApiPage<ProjectUpdate>> if changed
  // ...
};
*/

// Add new API function to get project updates by projectId
export const getProjectUpdatesByProjectIdApi = async (
  projectId: string,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[]
): Promise<ApiPage<ProjectUpdate>> => {
  try {
    const result = await fetchSpringPageData<ProjectUpdate>(
      "/api/private/admin/project-updates/by-project",
      page,
      size,
      sortConfig,
      { projectId }
    );
    return result;
  } catch (error) {
    console.error("Failed to fetch project updates by project ID:", error);
    throw error;
  }
};

// Get all updates (admin only) - FIX THIS FUNCTION
export const getAllProjectUpdatesApi = async (
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[],
  filters?: Record<string, any>
): Promise<ApiPage<ProjectUpdate>> => {
  try {
    const apiPageResult = await fetchSpringPageData<ProjectUpdate>(
      "/api/private/admin/project-updates", // Your endpoint
      page,
      size,
      sortConfig,
      filters
    );

    // console.log(
    //   "getAllProjectUpdatesApi - result from fetchSpringPageData:",
    //   JSON.stringify(apiPageResult, null, 2)
    // );
    return apiPageResult; // Return the result directly from fetchSpringPageData

    //     // Extract the actual array of updates
    //     const actualUpdatesArray = (result.items as any)?.content || [];

    //     return {
    //       ...result, // Spread original result properties
    //       items: actualUpdatesArray, // Ensure the 'items' property also holds the correct array
    //       updates: actualUpdatesArray, // Ensure 'updates' holds the correct array
    //     };
  } catch (error) {
    console.error("Error fetching all project updates:", error);
    // Return an empty ApiPage when error occurs
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
    } as ApiPage<ProjectUpdate>;
  }
};

// Get a specific update by ID
export const getProjectUpdateByIdApi = async (
  updateId: number
): Promise<ProjectUpdate> => {
  try {
    const { data } = await axiosClient.get(
      `api/notifications/project-updates/${updateId}`
    );
    return data;
  } catch (error) {
    console.error(`Error fetching project update with ID ${updateId}:`, error);
    throw error;
  }
};

// Helper function to get project type by projectId
const getProjectTypeById = async (projectId: string): Promise<"LABOR" | "FIXED_PRICE"> => {
  try {
    // Try to get project details from both endpoints to determine type
    try {
      await getProjectLaborDetailsApi(projectId);
      return "LABOR";
    } catch (error) {
      // If labor endpoint fails, try fixed price
      try {
        await getProjectFixedPriceDetailsApi(projectId);
        return "FIXED_PRICE";
      } catch (fixedPriceError) {
        throw new Error(`Project with ID ${projectId} not found in either labor or fixed price projects`);
      }
    }
  } catch (error) {
    console.error(`Error determining project type for ID ${projectId}:`, error);
    throw error;
  }
};

// Create a new project update - Updated to use new endpoints based on project type
// Note: Only the POST endpoint for creating project updates has been updated to use new endpoints
// Other endpoints (PUT, DELETE, PATCH) still use the old endpoint structure
export const createProjectUpdateApi = async (
  updateData: ProjectUpdateRequestPayload
): Promise<ProjectUpdate> => {
  try {
    console.log("Creating project update with data:", updateData);

    // Validate required fields based on note.txt
    if (!updateData.projectId) {
      throw new Error("Project ID is required");
    }
    if (!updateData.updateDate) {
      throw new Error("Update date is required");
    }
    if (!updateData.statusAtUpdate) {
      throw new Error("Status at update is required");
    }
    
    // Validate details length if provided (10-2000 characters as per note.txt)
    if (updateData.details && (updateData.details.length < 10 || updateData.details.length > 2000)) {
      throw new Error("Details must be between 10 and 2000 characters");
    }

    // Determine project type first
    const projectType = await getProjectTypeById(updateData.projectId);
    
    let endpoint: string;
    if (projectType === "LABOR") {
      // For Labor projects: POST /api/private/admin/project-labor/{projectLaborId}/updates
      endpoint = `/api/private/admin/project-labor/${updateData.projectId}/updates`;
    } else {
      // For Fixed Price projects: POST /api/private/admin/project-fixed-price/{projectFixedPriceId}/updates
      endpoint = `/api/private/admin/project-fixed-price/${updateData.projectId}/updates`;
    }

    console.log(`Using endpoint for ${projectType} project:`, endpoint);

    const { data } = await axiosClient.post(endpoint, updateData);
    return data;
  } catch (error) {
    console.error("Error creating project update:", error);
    throw error;
  }
};

// Update an existing project update
export const updateProjectUpdateApi = async (
  updateId: number,
  updateData: ProjectUpdateRequestPayload
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

export const updateProjectUpdateStatusApi = async (
  updateId: number,
  status: string
): Promise<void> => {
  try {
    await axiosClient.patch(
      `api/private/admin/project-updates/${updateId}/status`,
      null,
      {
        params: {
          status: status,
        },
      }
    );
  } catch (error) {
    console.error(
      `Error updating project update status with ID ${updateId}:`,
      error
    );
    throw error;
  }
};

export const updateProjectUpdateStatusForUserApi = async (
  updateId: number,
  status: string
): Promise<void> => {
  try {
    await axiosClient.patch(
      `/api/users/project-updates/${updateId}/status`,
      null,
      {
        params: {
          status: status,
        },
      }
    );
  } catch (error) {
    console.error(
      `Error updating project update status with ID ${updateId}:`,
      error
    );
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

// Get updates for a specific user (client)
export const getProjectUpdatesForUserApi = async (
  userId: number,
  page: number = 0,
  size: number = 10,
  filters?: Record<string, any>
): Promise<ApiPage<ProjectUpdate>> => {
  try {
    const params = {
      page,
      size,
      ...filters,
    };

    const { data } = await axiosClient.get(
      `/api/users/${userId}/project-updates`,
      { params }
    );
    return data;
  } catch (error) {
    console.error(`Error fetching project updates for user ${userId}:`, error);
    // Return empty page on error
    return {
      content: [],
      pageable: {
        pageNumber: page,
        pageSize: size,
        offset: page * size,
        paged: true,
        unpaged: false,
        sort: { sorted: false, unsorted: true, empty: true },
      },
      last: true,
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      sort: { sorted: false, unsorted: true, empty: true },
      first: true,
      numberOfElements: 0,
      empty: true,
    };
  }
};
