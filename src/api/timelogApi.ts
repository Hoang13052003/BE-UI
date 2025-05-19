import axiosClient from "./axiosClient";
import { SortConfig, fetchPaginatedData, PaginatedResult } from './apiUtils';

export interface TimeLogRequest {
  projectId: number;
  performerId: number;
  taskDate: string;
  taskDescription: string;
  hoursSpent: number;
}

export interface TimeLogResponse {
  id: number;
  projectId: number;
  projectName: string;
  performerId: number;
  performerFullName: string;
  taskDate: string;
  taskDescription: string;
  hoursSpent: number;
  createdAt?: string;
}

export interface ExcelUploadResponseDTO {
  message?: string;
  totalRowsInFile: number;
  successfulImports: number;
  failedImports: number;
  error?: string;
  errorsDetails?: string[]; // Đã định nghĩa là optional string array
}

export interface TimeLogFetchResult extends PaginatedResult<TimeLogResponse> {
  timelogs: TimeLogResponse[]; // Tương thích với code cũ
}

export const getTimeLogsByProjectIdApi = async (
  projectId: number,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[]
): Promise<TimeLogFetchResult> => {
  try {
    const result = await fetchPaginatedData<TimeLogResponse>(
      `/api/timelogs/project/${projectId}`, 
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

export const createTimeLogApi = async (payload: TimeLogRequest): Promise<TimeLogResponse> => {
  const { data } = await axiosClient.post('/api/timelogs', payload);
  return data;
};

export const getTimeLogByIdApi = async (timelogId: number): Promise<TimeLogResponse> => {
  const { data } = await axiosClient.get(`/api/timelogs/${timelogId}`);
  return data;
};

export const updateTimeLogApi = async (
  timelogId: number,
  payload: Partial<TimeLogRequest>
): Promise<TimeLogResponse> => {
  const { data } = await axiosClient.patch(`/api/timelogs/${timelogId}`, payload);
  return data;
};

export const deleteTimeLogApi = async (timelogId: number): Promise<void> => {
  try {
    await axiosClient.delete(`/api/timelogs/${timelogId}`);
  } catch (error) {
    console.error(`[timelogApi.ts] Failed to delete time log with ID: ${timelogId}`, error);
    throw error;
  }
};

export const getTimeLogsByUserIdApi = async (userId: number): Promise<TimeLogResponse[]> => {
  const { data } = await axiosClient.get(`/api/timelogs/user/${userId}`);
  return data;
};

export const getTimeLogsByDateRangeApi = async (
  startDate: string,
  endDate: string
): Promise<TimeLogResponse[]> => {
  const { data } = await axiosClient.get(`/api/timelogs/range`, {
    params: { startDate, endDate }
  });
  return data;
};

export const putUpdateTimeLogApi = async (
  timelogId: number,
  payload: TimeLogRequest
): Promise<void> => {
  await axiosClient.put(`/api/timelogs/${timelogId}`, payload);
};

export const uploadTimelogsExcelApi = async (
  projectId: number,
  file: File
): Promise<ExcelUploadResponseDTO> => {
  try {
    if (!file) {
      const noFileResponse = {
        error: 'No file selected',
        totalRowsInFile: 0,
        successfulImports: 0,
        failedImports: 0,
        errorsDetails: ['No file selected for upload.']
      };
      console.log('[timelogApi.ts] No file selected, returning:', noFileResponse);
      return noFileResponse;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId.toString());

    console.log('[timelogApi.ts] Sending FormData to API for projectId:', projectId);

    const { data } = await axiosClient.post( // Giả sử axiosClient được cấu hình đúng
      `/api/timelogs/upload-excel`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('[timelogApi.ts] Raw data from API:', data);

    const successResponse: ExcelUploadResponseDTO = {
      message: data.message || '',
      totalRowsInFile: data.totalRowsInFile || 0,
      successfulImports: data.successfulImports || 0,
      failedImports: data.failedImports || 0,
      error: data.error || undefined,
      errorsDetails: data.errorsDetails || []
    };
    console.log('[timelogApi.ts] Parsed success response:', successResponse);
    return successResponse;

  } catch (error: any) {
    console.error('[timelogApi.ts] Failed to upload Excel file (raw error object):', error);
    
    const responseData = error.response?.data;
    console.log('[timelogApi.ts] Error responseData from API:', responseData);
    
    if (responseData && typeof responseData === 'object') {
      const errorDto: ExcelUploadResponseDTO = {
        message: responseData.message,
        totalRowsInFile: responseData.totalRowsInFile || 0,
        successfulImports: responseData.successfulImports || 0,
        failedImports: typeof responseData.failedImports === 'number' ? responseData.failedImports : (responseData.error ? 1 : 0),
        error: responseData.error || error.message || 'Failed to upload Excel file.',
        errorsDetails: responseData.errorsDetails || [] 
      };
      console.log('[timelogApi.ts] Parsed error DTO:', errorDto);
      return errorDto;
    }
    
    const fallbackErrorDto: ExcelUploadResponseDTO = {
      message: undefined,
      totalRowsInFile: 0,
      successfulImports: 0,
      failedImports: 1,
      error: error.message || 'An unexpected error occurred during file upload.',
      errorsDetails: [error.message || 'An unexpected error occurred. Please check network or contact support.']
    };
    console.log('[timelogApi.ts] Fallback error DTO:', fallbackErrorDto);
    return fallbackErrorDto;
  }
};