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