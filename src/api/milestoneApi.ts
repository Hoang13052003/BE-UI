import axiosClient from "./axiosClient";
import { Milestone } from "../types/milestone";
export const getMilestonesByProjectIdApi = async (projectId: number): Promise<Milestone[]> => {
  const { data } = await axiosClient.get(`/api/projects/${projectId}/milestones`);
  return data;
};
