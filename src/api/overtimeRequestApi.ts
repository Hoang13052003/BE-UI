import axiosClient from "./axiosClient";
import {
  OvertimeRequest,
  CreateOvertimeRequestDto,
  ReviewOvertimeRequestDto,
} from "../types/overtimeRequest";

const BASE_URL = "/api/privates/overtime-requests";

// Create overtime request (MANAGER only)
export const createOvertimeRequestApi = async (
  data: CreateOvertimeRequestDto
): Promise<OvertimeRequest> => {
  const response = await axiosClient.post(BASE_URL, data);
  return response.data;
};

// Review overtime request (ADMIN only)
export const reviewOvertimeRequestApi = async (
  data: ReviewOvertimeRequestDto
): Promise<OvertimeRequest> => {
  const response = await axiosClient.put(`${BASE_URL}/review`, data);
  return response.data;
};

// Get all overtime requests (filtered by role automatically on backend)
export const getOvertimeRequestsApi = async (): Promise<OvertimeRequest[]> => {
  const response = await axiosClient.get(BASE_URL);
  return response.data;
};

// Get overtime request by ID
export const getOvertimeRequestByIdApi = async (
  id: number
): Promise<OvertimeRequest> => {
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return response.data;
};

// Interface for pagination and filter parameters
export interface OvertimeRequestFilters {
  page?: number;
  size?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  projectType?: 'LABOR' | 'FIXED_PRICE';
  projectName?: string; // Filter by project name
  search?: string;
  sort?: string[];
}

// Get overtime requests with pagination and filters
export const getOvertimeRequestsPaginatedApi = async (
  filters: OvertimeRequestFilters = {}
): Promise<{
  content: OvertimeRequest[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}> => {
  const params = new URLSearchParams();
  
  // Pagination
  if (filters.page !== undefined) params.append('page', filters.page.toString());
  if (filters.size !== undefined) params.append('size', filters.size.toString());
  
  // Filters
  if (filters.status) params.append('status', filters.status);
  if (filters.projectType) params.append('projectType', filters.projectType);
  if (filters.projectName) params.append('projectName', filters.projectName);
  if (filters.search) params.append('search', filters.search);
  
  // Sort
  if (filters.sort) {
    filters.sort.forEach(sort => params.append('sort', sort));
  }
  
  const response = await axiosClient.get(BASE_URL, { params });
  return response.data;
}; 