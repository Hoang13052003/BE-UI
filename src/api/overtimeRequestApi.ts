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

// Get overtime requests with pagination (if needed in future)
export const getOvertimeRequestsPaginatedApi = async (
  page: number = 0,
  size: number = 10
): Promise<{
  content: OvertimeRequest[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}> => {
  const response = await axiosClient.get(BASE_URL, {
    params: { page, size },
  });
  return response.data;
}; 