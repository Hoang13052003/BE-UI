import axiosClient from "./axiosClient";
import {
  Milestone,
  MilestoneUpdateRequestData,
  MilestoneCreateRequest,
  MilestoneSummaryDto,
} from "../types/milestone";

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

export interface MilestoneFilterParams {
  name?: string;
  status?: string;
  statuses?: string[];
  isCompleted?: boolean;
  isCurrentWeek?: boolean;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDirection?: string;
}

export const getMilestonesByProjectFixedPriceIdApi = async (
  projectFixedPriceId: string,
  page: number = 0,
  size: number = 10
): Promise<{ milestones: Milestone[]; totalItems: number }> => {
  try {
    const { data } = await axiosClient.get(
      `/api/milestones/project-fixed-price/${projectFixedPriceId}?page=${page}&size=${size}`
    );
    return {
      milestones: data.content || [],
      totalItems: data.totalElements || 0,
    };
  } catch (error) {
    console.error("Error fetching milestones for fixed price project:", error);
    throw error;
  }
};

export const getMilestonesByProjectFixedPriceIdWithFiltersApi = async (
  projectFixedPriceId: string,
  page: number = 0,
  size: number = 10,
  sort?: Array<{ property: string; direction: string }>,
  filters?: MilestoneFilterParams
): Promise<{ content: Milestone[]; totalElements: number; totalPages: number; size: number; number: number; first: boolean; last: boolean; numberOfElements: number; empty: boolean }> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Add filters if provided
    if (filters) {
      if (filters.name) params.append('name', filters.name);
      if (filters.status) params.append('status', filters.status);
      if (filters.statuses?.length) {
        filters.statuses.forEach(status => params.append('statuses', status));
      }
      if (filters.isCompleted !== undefined) params.append('isCompleted', filters.isCompleted.toString());
      if (filters.isCurrentWeek !== undefined) params.append('isCurrentWeek', filters.isCurrentWeek.toString());
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);
    }

    // Add sorting if provided
    if (sort?.length) {
      const sortParam = sort.map(s => `${s.property},${s.direction}`).join('&sort=');
      params.append('sort', sortParam);
    }

    const { data } = await axiosClient.get(
      `/api/milestones/project-fixed-price/${projectFixedPriceId}?${params.toString()}`
    );
    
    return {
      content: data.content || [],
      totalElements: data.totalElements || 0,
      totalPages: data.totalPages || 0,
      size: data.size || size,
      number: data.number || page,
      first: data.first || false,
      last: data.last || false,
      numberOfElements: data.numberOfElements || 0,
      empty: data.empty || false,
    };
  } catch (error) {
    console.error("Error fetching milestones for fixed price project:", error);
    throw error;
  }
};


export const deleteMilestoneApi = async (milestoneId: number): Promise<void> => {
  try {
    await axiosClient.delete(`/api/milestones/${milestoneId}`);
  } catch (error) {
    console.error("Error deleting milestone:", error);
    throw error;
  }
};

export const createMilestoneForFixedPriceProjectApi = async (
  projectFixedPriceId: string,
  milestoneData: MilestoneCreateRequest
): Promise<Milestone> => {
  try {
    const { data } = await axiosClient.post<Milestone>(
      `/api/milestones/project-fixed-price/${projectFixedPriceId}`,
      milestoneData
    );
    return data;
  } catch (error) {
    console.error("Error creating milestone for fixed price project:", error);
    throw error;
  }
};

export const getMilestoneSummaryForFixedPriceProjectApi = async (
  projectId: string
): Promise<MilestoneSummaryDto> => {
  try {
    const { data } = await axiosClient.get<MilestoneSummaryDto>(
      `/api/projects/fixed-price/${projectId}/milestone-summary`
    );
    return data;
  } catch (error) {
    console.error("Error fetching milestone summary for fixed price project:", error);
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

export const getMilestoneByIdApi = async (milestoneId: number): Promise<Milestone> => {
  try {
    const { data } = await axiosClient.get(`/api/milestones/${milestoneId}`);
    return data;
  } catch (error) {
    console.error("Error fetching milestone by ID:", error);
    throw error;
  }
};

export const updateMilestoneApi = async (
  milestoneId: number,
  milestoneData: MilestoneUpdateRequestData
): Promise<Milestone> => {
  try {
    const { data } = await axiosClient.patch(
      `/api/milestones/${milestoneId}`,
      milestoneData
    );
    return data;
  } catch (error) {
    console.error("Error updating milestone:", error);
    throw error;
  }
};

export type { MilestoneUpdateRequestData, MilestoneCreateRequest, MilestoneSummaryDto };

// Alias for ProjectMilestonesTab compatibility
export const getProjectMilestonesOverviewApi = async (
  projectId: string,
  page: number = 0,
  size: number = 10,
  sort?: Array<{ property: string; direction: string }>,
  filters?: MilestoneFilterParams
) => {
  return getMilestonesByProjectFixedPriceIdWithFiltersApi(projectId, page, size, sort, filters);
};
