import axiosClient from "./axiosClient";
import { Milestone, MilestoneUpdateRequestData} from "../types/milestone";

export const getMilestonesByProjectIdApi = async (projectId: number): Promise<Milestone[]> => {
  const { data } = await axiosClient.get(`/api/projects/${projectId}/milestones`);
  return data;
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
  completed: boolean
): Promise<Milestone> => { // Assuming the API returns the updated milestone
  const { data } = await axiosClient.patch(`/api/milestones/${milestoneId}/complete`, { completed });
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