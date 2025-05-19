import axiosClient from "./axiosClient";
import { Milestone, MilestoneUpdateRequestData} from "../types/milestone";
import { SortConfig, fetchPaginatedData, PaginatedResult } from './apiUtils';

export interface MilestoneFetchResult extends PaginatedResult<Milestone> {
  milestones: Milestone[]; // Tương thích với code cũ
}

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
export type { MilestoneUpdateRequestData };