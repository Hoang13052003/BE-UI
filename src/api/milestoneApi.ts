import axiosClient from "./axiosClient";
import { Milestone, MilestoneUpdateRequestData } from "../types/milestone";
import { SortConfig, fetchPaginatedData, PaginatedResult } from "./apiUtils";

export interface MilestoneFetchResult extends PaginatedResult<Milestone> {
  milestones: Milestone[];
}

export interface BatchUpdateMilestoneItemDTO {
  id: number;
  name?: string;
  description?: string;
  startDate?: string;
  deadlineDate?: string;
  status?: "TODO" | "DOING" | "PENDING" | "COMPLETED";
  notes?: string;
  completionDate?: string;
  completionPercentage?: number;
}

export interface BatchUpdateMilestoneItem extends BatchUpdateMilestoneItemDTO {}

export const getMilestonesByProjectIdApi = async (
  projectId: string,
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
      milestones: result.items,
    };
  } catch (error) {
    console.error("Error fetching milestones:", error);
    throw error;
  }
};

export const deleteMilestoneApi = async (
  milestoneId: number
): Promise<void> => {
  try {
    await axiosClient.delete(`/api/milestones/${milestoneId}`);
  } catch (error) {
    console.error(
      `[milestoneApi.ts] axiosClient.delete failed for milestoneId: ${milestoneId}`,
      error
    ); // LOG 9
    throw error;
  }
};

export const getMilestoneByIdApi = async (
  milestoneId: number
): Promise<Milestone> => {
  const { data } = await axiosClient.get(`/api/milestones/${milestoneId}`);
  return data;
};

export const updateMilestoneApi = async (
  milestoneId: number,
  payload: MilestoneUpdateRequestData
): Promise<Milestone> => {
  const { data } = await axiosClient.patch(
    `/api/milestones/${milestoneId}`,
    payload
  );
  return data;
};

export const updateMilestoneCompletionStatusApi = async (
  milestoneId: number,
  completed: boolean,
  completionPercentage?: number
): Promise<Milestone> => {
  const { data } = await axiosClient.patch(
    `/api/milestones/${milestoneId}/complete`,
    {
      completed,
      ...(completionPercentage !== undefined && { completionPercentage }),
    }
  );
  return data;
};

export const isMilestoneCompletedApi = async (
  milestoneId: number
): Promise<boolean> => {
  try {
    const { data } = await axiosClient.get<boolean>(
      `/api/milestones/${milestoneId}/is-completed`
    );
    return data;
  } catch (error) {
    console.error(
      `[milestoneApi.ts] Failed to fetch completion status for milestone ${milestoneId}:`,
      error
    );
    throw error;
  }
};

export const batchUpdateMilestonesApi = async (
  updateItems: BatchUpdateMilestoneItemDTO[]
): Promise<void> => {
  try {
    if (!Array.isArray(updateItems) || updateItems.length === 0) {
      throw new Error("Update items must be a non-empty array");
    }

    updateItems.forEach((item, index) => {
      if (!item.id || typeof item.id !== "number") {
        throw new Error(`Item at index ${index} is missing required id`);
      }
    });

    const formattedItems = updateItems.map((item) => ({
      ...item,
      startDate: item.startDate ? item.startDate.split("T")[0] : undefined,
      deadlineDate: item.deadlineDate
        ? item.deadlineDate.split("T")[0]
        : undefined,
      completionDate: item.completionDate
        ? item.completionDate.split("T")[0]
        : undefined,
    }));

    await axiosClient.patch("/api/milestones/batch-update", formattedItems);
  } catch (error) {
    console.error("Error batch updating milestones:", error);
    throw error;
  }
};

export const batchDeleteMilestonesApi = async (
  milestoneIds: number[]
): Promise<void> => {
  try {
    if (!Array.isArray(milestoneIds) || milestoneIds.length === 0) {
      throw new Error("Milestone IDs must be a non-empty array");
    }

    milestoneIds.forEach((id, index) => {
      if (!id || typeof id !== "number") {
        throw new Error(`Invalid milestone ID at index ${index}: ${id}`);
      }
    });

    const queryParams = milestoneIds.map((id) => `ids=${id}`).join("&");
    await axiosClient.delete(`/api/milestones/batch-delete?${queryParams}`);
  } catch (error) {
    console.error("Error batch deleting milestones:", error);
    throw error;
  }
};

export type { MilestoneUpdateRequestData };
