import axiosClient from "./axiosClient";
import { Project } from "../types/project"; // Assuming this matches ProjectResponseDto
// Import the new request type
import { ProjectRequest } from "../types/ProjectRequest"; // Type for POST request body

/**
 * Fetches a list of projects.
 * Assumes the endpoint returns an array of Project objects.
 */
export const getProjectsApi = async (): Promise<Project[]> => {
  // Updated endpoint to match the Java controller @RequestMapping
  const { data } = await axiosClient.get("/api/projects");
  return data;
};

/**
 * Creates a new project.
 * @param projectData The data for the new project (matching ProjectRequestDto).
 * Assumes the endpoint returns the created Project object upon success (201 Created).
 */
export const createProjectApi = async (projectData: ProjectRequest): Promise<Project> => {
    // Updated endpoint to match the Java controller @PostMapping
    // The second argument to post is the request body (projectData)
    // Assuming backend returns the created project object in the response body
    const { data } = await axiosClient.post("/api/projects", projectData);
    return data;
};

/**
 * Deletes a project by its ID.
 * @param projectId The ID of the project to delete.
 * Assumes the endpoint returns no content on success (204 No Content).
 */
export const deleteProjectApi = async (projectId: number): Promise<void> => {
    // Updated endpoint to match the Java controller @DeleteMapping
    await axiosClient.delete(`/api/projects/${projectId}`);
    // No return value needed for a successful delete (204 No Content)
};

// Removed getProjectByIdApi as it doesn't have a corresponding endpoint in the provided Java controller