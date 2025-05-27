// src/api/projectUpdateApi.ts
import axiosClient from "./axiosClient";
// SỬ DỤNG fetchSpringPageData VÀ CÁC TYPE LIÊN QUAN ĐẾN ApiPage
import { SortConfig, fetchSpringPageData } from "./apiUtils"; // << CHỈ CẦN fetchSpringPageData (và SortConfig)
import { ApiPage } from "../types/project"; // << IMPORT ApiPage

// Project Update Types
export interface ProjectUpdate { // Kiểu này giữ nguyên, khớp với item trong 'content'
  id: number;
  projectId: number;
  projectName: string;
  projectType: string;
  userId: number; 
  email: string;  
  updateDate: string;
  summary: string | null;
  details: string | null;
  statusAtUpdate: string; 
  completionPercentage: number | null;
  // createdByUserId?: number; // Thêm nếu backend DTO có những trường này và ProjectUpdateTimelineItem cần
  createdByName?: string;   // Thêm nếu backend DTO có những trường này và ProjectUpdateTimelineItem cần
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

// Bỏ ProjectUpdateFetchResult nếu không còn API nào dùng đến nó
// export interface ProjectUpdateFetchResult extends PaginatedResult<ProjectUpdate> {
//   updates: ProjectUpdate[];
// }

// Hàm getProjectUpdatesApi (lấy update cho 1 project cụ thể)
// Nếu API `/api/private/admin/${projectId}/updates` cũng trả về Spring Page,
// bạn cũng nên cho nó gọi fetchSpringPageData.
// Hiện tại, tôi giả sử nó vẫn dùng fetchPaginatedData (cũ) nếu bạn chưa muốn sửa.
// Nếu muốn sửa, hãy làm tương tự như getAllProjectUpdatesApi.
/*
export const getProjectUpdatesApi = async (
  projectId: number,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[]
): Promise<ProjectUpdateFetchResult> => { // HOẶC Promise<ApiPage<ProjectUpdate>> nếu sửa
  // ...
};
*/

// Get all updates (admin only) - SỬA HÀM NÀY
export const getAllProjectUpdatesApi = async (
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[],
  filters?: Record<string, any>
): Promise<ApiPage<ProjectUpdate>> => { // << THAY ĐỔI KIỂU TRẢ VỀ THÀNH ApiPage
  try {
    // Gọi hàm fetchSpringPageData (mới)
    const apiPageResult = await fetchSpringPageData<ProjectUpdate>( 
      "/api/private/admin/project-updates", // Endpoint của bạn
      page,
      size,
      sortConfig,
      filters
    );
    
    console.log("getAllProjectUpdatesApi - result from fetchSpringPageData:", JSON.stringify(apiPageResult, null, 2));
    return apiPageResult; // Trả về trực tiếp kết quả từ fetchSpringPageData

  } catch (error) {
    console.error("Error fetching all project updates:", error);
    // Trả về một ApiPage rỗng khi có lỗi
    const defaultSortInfo = { sorted: false, unsorted: true, empty: true };
    const defaultPageable = { pageNumber: page, pageSize: size, offset: page * size, paged: true, unpaged: false, sort: defaultSortInfo };
    return {
        content: [], pageable: defaultPageable, last: true, totalPages: 0, totalElements: 0,
        size: size, number: page, sort: defaultSortInfo, first: true, numberOfElements: 0, empty: true
    } as ApiPage<ProjectUpdate>;
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
