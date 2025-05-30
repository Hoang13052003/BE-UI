import axiosClient from "./axiosClient";
import { SortConfig, fetchPaginatedData, PaginatedResult } from './apiUtils';

// Các kiểu trạng thái có thể có (khớp với TimelogStatusEnum ở backend)
export type TimelogStatusType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export interface TimeLogRequest {
  projectId: number;
  performerId: number;
  taskDate: string; // YYYY-MM-DD
  taskDescription: string;
  hoursSpent: number;
}

// =======================================================
// THAY ĐỔI CHÍNH Ở ĐÂY: TimeLogResponse Interface
// =======================================================
export interface TimeLogResponse {
  id: number;

  performer: {
    id: number;
    fullName: string;
    email: string;
  };

  taskDate: string; // YYYY-MM-DD
  taskDescription: string;
  hoursSpent: number;
  createdAt?: string; // Hoặc Instant nếu bạn đồng bộ kiểu với backend DTO
  actualTimelogStatus?: TimelogStatusType; 
  computedTimelogStatus?: string; // Giữ nguyên vì đây là computed value
}
// =======================================================

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
}

// Hàm getTimeLogsByProjectIdApi sẽ tự động dùng TimeLogResponse mới khi fetchPaginatedData được generic hóa
export const getTimeLogsByProjectIdApi = async (
  projectId: number,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[]
): Promise<TimeLogFetchResult> => {
  try {
    const result = await fetchPaginatedData<TimeLogResponse>( // Sử dụng TimeLogResponse đã cập nhật
      `/api/timelogs/project/${projectId}/details`,
      page,
      size,
      sortConfig
    );
    return {
      ...result,
      timelogs: result.items
    };
  } catch (error) {
    console.error("Error fetching timelogs:", error);
    throw error;
  }
};

// createTimeLogApi: Payload vẫn dùng performerId, nhưng response sẽ có performer object
export const createTimeLogApi = async (payload: TimeLogRequest): Promise<TimeLogResponse> => {
  const { data } = await axiosClient.post<TimeLogResponse>('/api/timelogs', payload);
  return data;
};

// getTimeLogByIdApi: Response sẽ có performer object
export const getTimeLogByIdApi = async (timelogId: number): Promise<TimeLogResponse> => {
  const { data } = await axiosClient.get<TimeLogResponse>(`/api/timelogs/${timelogId}`);
  return data;
};

// patchUpdateTimeLogApi: Payload vẫn dùng performerId
export const patchUpdateTimeLogApi = async (
  timelogId: number,
  payload: Partial<BatchUpdateItem>
): Promise<void> => {
  await axiosClient.patch(`/api/timelogs/${timelogId}`, payload);
};

// deleteTimeLogApi: không thay đổi
export const deleteTimeLogApi = async (timelogId: number): Promise<void> => {
  try {
    await axiosClient.delete(`/api/timelogs/${timelogId}`);
  } catch (error) {
    console.error(`[timelogApi.ts] Failed to delete time log with ID: ${timelogId}`, error);
    throw error;
  }
};

// batchUpdateTimeLogsApi: Payload BatchUpdateItem vẫn dùng performerId
export const batchUpdateTimeLogsApi = async (updates: BatchUpdateItem[]): Promise<void> => {
  try {
    const response = await axiosClient.patch('/api/timelogs/batch-update', updates);
    return response.data;
  } catch (error: any) {
    console.error("[timelogApi.ts] Failed to batch update time logs:", error);
    throw error;
  }
};

// batchDeleteTimeLogsApi: không thay đổi
export const batchDeleteTimeLogsApi = async (ids: number[]): Promise<void> => {
  try {
    if (!ids || ids.length === 0) {
      return;
    }
    
    const params = new URLSearchParams();
    ids.forEach(id => params.append('ids', id.toString()));

    await axiosClient.delete(`/api/timelogs/batch-delete?${params.toString()}`);

  } catch (error: any) {
    console.error("[timelogApi.ts] Failed to batch delete time logs:", error);
    throw error;
  }
};

// getTimeLogsByUserIdApi: Response cần được kiểm tra lại
export const getTimeLogsByUserIdApi = async (userId: number): Promise<TimeLogResponse[]> => {
  const { data } = await axiosClient.get<TimeLogResponse[]>(`/api/timelogs/user/${userId}`);
  return data;
};

// getTimeLogsByDateRangeApi: Response cần được kiểm tra lại
export const getTimeLogsByDateRangeApi = async (
  startDate: string,
  endDate: string
): Promise<TimeLogResponse[]> => {
  const { data } = await axiosClient.get<TimeLogResponse[]>(`/api/timelogs/range`, {
    params: { startDate, endDate }
  });
  return data;
};

// putUpdateTimeLogApi: Payload TimeLogRequest vẫn dùng performerId
export const putUpdateTimeLogApi = async (
  timelogId: number,
  payload: TimeLogRequest
): Promise<void> => {
  await axiosClient.put(`/api/timelogs/${timelogId}`, payload);
};

// uploadTimelogsExcelApi: không thay đổi
export const uploadTimelogsExcelApi = async (
  projectId: number,
  file: File
): Promise<ExcelUploadResponseDTO> => {
  try {
    if (!file) {
      return {
        error: 'No file selected',
        totalRowsInFile: 0,
        successfulImports: 0,
        failedImports: 0,
        errorsDetails: ['No file selected for upload.']
      };
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId.toString());

    const { data } = await axiosClient.post( 
      `/api/timelogs/upload-excel`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      message: data.message || '',
      totalRowsInFile: data.totalRowsInFile || 0,
      successfulImports: data.successfulImports || 0,
      failedImports: data.failedImports || 0,
      error: data.error || undefined,
      errorsDetails: data.errorsDetails || []
    };

  } catch (error: any) {
    console.error('[timelogApi.ts] Failed to upload Excel file:', error);
    
    const responseData = error.response?.data;
    
    if (responseData && typeof responseData === 'object') {
      return {
        message: responseData.message,
        totalRowsInFile: responseData.totalRowsInFile || 0,
        successfulImports: responseData.successfulImports || 0,
        failedImports: typeof responseData.failedImports === 'number' ? responseData.failedImports : (responseData.error ? 1 : 0),
        error: responseData.error || error.message || 'Failed to upload Excel file.',
        errorsDetails: responseData.errorsDetails || [] 
      };
    }
    
    return {
      message: undefined,
      totalRowsInFile: 0,
      successfulImports: 0,
      failedImports: 1,
      error: error.message || 'An unexpected error occurred during file upload.',
      errorsDetails: [error.message || 'An unexpected error occurred. Please check network or contact support.']
    };
  }
};