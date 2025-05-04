import axiosClient from "./axiosClient";
import { Milestone } from "../types/milestone";
export const getMilestonesByProjectIdApi = async (projectId: number): Promise<Milestone[]> => {
  // Endpoint khớp với @GetMapping("/{projectId}/milestones") trong controller /projects
  const { data } = await axiosClient.get(`/api/projects/${projectId}/milestones`);
  return data;
};
