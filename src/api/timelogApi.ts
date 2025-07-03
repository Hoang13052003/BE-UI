import axiosClient from "./axiosClient";
import { SortConfig, fetchPaginatedData, PaginatedResult } from "./apiUtils";

export type TimelogStatusType =
  | "TODO"
  | "DOING"
  | "PENDING"
  | "COMPLETED";

export interface TimeLogRequest {
  performerId: number;
  taskDate: string; // YYYY-MM-DD
  taskDescription: string;
  hoursSpent: number;
}

export interface TimeLogResponse {
  id: number;
  projectLaborId: string;
  projectName: string;
  performerId: number;
  performerFullName: string;
  taskDate: string; // YYYY-MM-DD
  taskDescription: string;
  hoursSpent: number;
  createdAt?: string;
  computedTimelogStatus?: string;
  actualTimelogStatus?: TimelogStatusType;
  completionPercentage?: number;
}

export interface ExcelUploadResponseDTO {
  message?: string;
  totalRowsInFile: number;
  successfulImports: number;
  failedImports: number;
  error?: string;
  errorsDetails?: string[];
}

export interface TimeLogFetchResult extends PaginatedResult<TimeLogResponse> {
  timelogs: TimeLogResponse[];
}

export interface BatchUpdateItem {
  id: number;
  performerId?: number;
  taskDate?: string;
  taskDescription?: string;
  hoursSpent?: number;
  actualTimelogStatus?: TimelogStatusType;
  completionPercentage?: number;
}

export const getTimeLogsByProjectIdApi = async (
  projectId: string,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[]
): Promise<TimeLogFetchResult> => {
  try {
    const result = await fetchPaginatedData<TimeLogResponse>(
      `/api/timelogs/project-labor/${projectId}`,
      page,
      size,
      sortConfig
    );
    
    return {
      ...result,
      timelogs: result.items,
    };
  } catch (error) {
    console.error("Error fetching timelogs:", error);
    throw error;
  }
};

export const createTimeLogApi = async (
  projectLaborId: string,
  payload: TimeLogRequest
): Promise<TimeLogResponse> => {
  const { data } = await axiosClient.post<TimeLogResponse>(
    `/api/timelogs/project-labor/${projectLaborId}/timelogs`,
    payload
  );
  return data;
};

export const getTimeLogByIdApi = async (
  timelogId: number
): Promise<TimeLogResponse> => {
  const { data } = await axiosClient.get<TimeLogResponse>(
    `/api/timelogs/${timelogId}`
  );
  return data;
};

export const patchUpdateTimeLogApi = async (
  timelogId: number,
  payload: Partial<BatchUpdateItem>
): Promise<void> => {
  await axiosClient.patch(`/api/timelogs/${timelogId}`, payload);
};

export const deleteTimeLogApi = async (timelogId: number): Promise<void> => {
  try {
    await axiosClient.delete(`/api/timelogs/${timelogId}`);
  } catch (error) {
    console.error(
      `[timelogApi.ts] Failed to delete time log with ID: ${timelogId}`,
      error
    );
    throw error;
  }
};

export const batchUpdateTimeLogsApi = async (
  updates: BatchUpdateItem[]
): Promise<void> => {
  try {
    await axiosClient.patch("/api/timelogs/batch-update", updates);
  } catch (error: any) {
    console.error("[timelogApi.ts] Failed to batch update time logs:", error);
    throw error;
  }
};

export const batchDeleteTimeLogsApi = async (ids: number[]): Promise<void> => {
  try {
    if (!ids || ids.length === 0) {
      return;
    }

    const params = new URLSearchParams();
    ids.forEach((id) => params.append("ids", id.toString()));

    await axiosClient.delete(`/api/timelogs/batch-delete?${params.toString()}`);
  } catch (error: any) {
    console.error("[timelogApi.ts] Failed to batch delete time logs:", error);
    throw error;
  }
};

export const getTimeLogsByUserIdApi = async (
  userId: number
): Promise<TimeLogResponse[]> => {
  const { data } = await axiosClient.get<TimeLogResponse[]>(
    `/api/timelogs/user/${userId}`
  );
  return data;
};

export const getTimeLogsByDateRangeApi = async (
  startDate: string,
  endDate: string
): Promise<TimeLogResponse[]> => {
  const { data } = await axiosClient.get<TimeLogResponse[]>(
    `/api/timelogs/range`,
    {
      params: { startDate, endDate },
    }
  );
  return data;
};

export const putUpdateTimeLogApi = async (
  timelogId: number,
  payload: TimeLogRequest
): Promise<void> => {
  await axiosClient.put(`/api/timelogs/${timelogId}`, payload);
};

export const uploadTimelogsExcelApi = async (
  projectLaborId: string,
  file: File
): Promise<ExcelUploadResponseDTO> => {
  try {
    if (!file) {
      return {
        error: "No file selected",
        totalRowsInFile: 0,
        successfulImports: 0,
        failedImports: 0,
        errorsDetails: ["No file selected for upload."],
      };
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectLaborId", projectLaborId.toString());

    const { data } = await axiosClient.post(
      `/api/timelogs/upload-excel`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      message: data.message || "",
      totalRowsInFile: data.totalRowsInFile || 0,
      successfulImports: data.successfulImports || 0,
      failedImports: data.failedImports || 0,
      error: data.error || undefined,
      errorsDetails: data.errorsDetails || [],
    };
  } catch (error: any) {
    console.error("[timelogApi.ts] Failed to upload Excel file:", error);

    const responseData = error.response?.data;

    if (responseData && typeof responseData === "object") {
      return {
        message: responseData.message,
        totalRowsInFile: responseData.totalRowsInFile || 0,
        successfulImports: responseData.successfulImports || 0,
        failedImports:
          typeof responseData.failedImports === "number"
            ? responseData.failedImports
            : responseData.error
            ? 1
            : 0,
        error:
          responseData.error || error.message || "Failed to upload Excel file.",
        errorsDetails: responseData.errorsDetails || [],
      };
    }

    return {
      message: undefined,
      totalRowsInFile: 0,
      successfulImports: 0,
      failedImports: 1,
      error:
        error.message || "An unexpected error occurred during file upload.",
      errorsDetails: [
        error.message ||
          "An unexpected error occurred. Please check network or contact support.",
      ],
    };
  }
};
