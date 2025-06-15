import axiosClient from "./axiosClient";
import { Milestone, MilestoneUpdateRequestData} from "../types/milestone";
import { SortConfig, fetchPaginatedData, PaginatedResult } from './apiUtils';

export interface MilestoneFetchResult extends PaginatedResult<Milestone> {
  milestones: Milestone[]; // Tương thích với code cũ
}

// Interface for batch update - theo hướng dẫn BE
export interface BatchUpdateMilestoneItemDTO {
  id: number;                           // Required - ID của milestone cần update
  name?: string;                        // Optional - Tên milestone (max 200 chars)
  description?: string;                 // Optional - Mô tả (max 65535 chars)
  startDate?: string;                   // Optional - Ngày bắt đầu (YYYY-MM-DD)
  deadlineDate?: string;                // Optional - Ngày deadline (YYYY-MM-DD)
  status?: 'NEW' | 'SENT' | 'REVIEWED'; // Optional - Trạng thái milestone
  notes?: string;                       // Optional - Ghi chú
  completionDate?: string;              // Optional - Ngày hoàn thành (YYYY-MM-DD)
  completionPercentage?: number;        // Optional - Phần trăm hoàn thành (0-100)
}

// Alias for backwards compatibility
export interface BatchUpdateMilestoneItem extends BatchUpdateMilestoneItemDTO {}

export const getMilestonesByProjectIdApi = async (
  projectId: number,
  page: number = 0,
  size: number = 10,
  sortConfig?: SortConfig | SortConfig[]
): Promise<MilestoneFetchResult> => {
  try {
    const result = await fetchPaginatedData<Milestone>(
      `/api/projects/${projectId}/milestones`, 
      page, 
      size, 
      sortConfig
    );
    
    return {
      ...result,
      milestones: result.items
    };
  } catch (error) {
    console.error("Error fetching milestones:", error);
    throw error;
  }
};

export const deleteMilestoneApi = async (milestoneId: number): Promise<void> => {
  console.log(`[milestoneApi.ts] deleteMilestoneApi called with milestoneId: ${milestoneId}`); // LOG 7
  try {
    await axiosClient.delete(`/api/milestones/${milestoneId}`);
    console.log(`[milestoneApi.ts] axiosClient.delete successful for milestoneId: ${milestoneId}`); // LOG 8
  } catch (error) {
    console.error(`[milestoneApi.ts] axiosClient.delete failed for milestoneId: ${milestoneId}`, error); // LOG 9
    throw error; // Re-throw the error to be caught by the caller
  }
};

export const getMilestoneByIdApi = async (milestoneId: number): Promise<Milestone> => {
  const { data } = await axiosClient.get(`/api/milestones/${milestoneId}`);
  return data;
};

export const updateMilestoneApi = async (
  milestoneId: number,
  payload: MilestoneUpdateRequestData
): Promise<Milestone> => {
  const { data } = await axiosClient.patch(`/api/milestones/${milestoneId}`, payload);
  return data;
};

export const updateMilestoneCompletionStatusApi = async (
  milestoneId: number,
  completed: boolean,
  completionPercentage?: number
): Promise<Milestone> => { // Assuming the API returns the updated milestone
  const { data } = await axiosClient.patch(`/api/milestones/${milestoneId}/complete`, { 
    completed, 
    ...(completionPercentage !== undefined && { completionPercentage })
  });
  return data;
};

export const isMilestoneCompletedApi = async (milestoneId: number): Promise<boolean> => {
  try {
    const { data } = await axiosClient.get<boolean>(`/api/milestones/${milestoneId}/is-completed`);
    return data;
  } catch (error) {
    console.error(`[milestoneApi.ts] Failed to fetch completion status for milestone ${milestoneId}:`, error);
    throw error;
  }
};

// Batch update milestones API - theo hướng dẫn BE
export const batchUpdateMilestonesApi = async (updateItems: BatchUpdateMilestoneItemDTO[]): Promise<void> => {
  try {
    // Validate input
    if (!Array.isArray(updateItems) || updateItems.length === 0) {
      throw new Error('Update items must be a non-empty array');
    }

    // Validate each item has required id
    updateItems.forEach((item, index) => {
      if (!item.id || typeof item.id !== 'number') {
        throw new Error(`Item at index ${index} is missing required id`);
      }
    });

    // Convert dates to YYYY-MM-DD format if they're ISO strings
    const formattedItems = updateItems.map(item => ({
      ...item,
      startDate: item.startDate ? item.startDate.split('T')[0] : undefined,
      deadlineDate: item.deadlineDate ? item.deadlineDate.split('T')[0] : undefined,
      completionDate: item.completionDate ? item.completionDate.split('T')[0] : undefined,
    }));

    await axiosClient.patch('/api/milestones/batch-update', formattedItems);
  } catch (error) {
    console.error('Error batch updating milestones:', error);
    throw error;
  }
};

// Batch delete milestones API - sử dụng endpoint thực từ backend
// Endpoint: DELETE /api/milestones/batch-delete?ids=1&ids=2&ids=3
export const batchDeleteMilestonesApi = async (milestoneIds: number[]): Promise<void> => {
  try {
    if (!Array.isArray(milestoneIds) || milestoneIds.length === 0) {
      throw new Error('Milestone IDs must be a non-empty array');
    }

    // Validate all IDs are numbers
    milestoneIds.forEach((id, index) => {
      if (!id || typeof id !== 'number') {
        throw new Error(`Invalid milestone ID at index ${index}: ${id}`);
      }
    });

    // Call backend batch delete endpoint với query parameters
    const queryParams = milestoneIds.map(id => `ids=${id}`).join('&');
    await axiosClient.delete(`/api/milestones/batch-delete?${queryParams}`);
  } catch (error) {
    console.error('Error batch deleting milestones:', error);
    throw error;
  }
};

export type { MilestoneUpdateRequestData };