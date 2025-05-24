import axiosClient from "./axiosClient";

export interface Feedback {
  id: string;
  projectId: number;
  userId: number;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface CreateFeedbackRequest {
  projectId: number;
  userId: number;
  content: string;
}

export interface UpdateFeedbackRequest {
  projectId: number;
  userId: number;
  content: string;
}

export interface PaginatedFeedbackResponse {
  content: Feedback[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Create new feedback
export const createFeedback = async (
  feedbackData: CreateFeedbackRequest
): Promise<Feedback> => {
  const { data } = await axiosClient.post("/api/feedbacks", feedbackData);
  return data;
};

// Update feedback
export const updateFeedback = async (
  id: string,
  feedbackData: UpdateFeedbackRequest
): Promise<Feedback> => {
  const { data } = await axiosClient.put(`/api/feedbacks/${id}`, feedbackData);
  return data;
};

// Delete feedback
export const deleteFeedback = async (id: string): Promise<void> => {
  await axiosClient.delete(`/api/feedbacks/${id}`);
};

// Get feedback by ID
export const getFeedbackById = async (id: string): Promise<Feedback> => {
  const { data } = await axiosClient.get(`/api/feedbacks/${id}`);
  return data;
};

// Get feedbacks by user ID and project ID with pagination
export const getFeedbacksByUserAndProject = async (
  userId: number,
  projectId: number,
  page: number = 0,
  size: number = 10,
  sort?: string
): Promise<PaginatedFeedbackResponse> => {
  const params: any = { page, size };
  if (sort) {
    params.sort = sort;
  }

  const { data } = await axiosClient.get(
    `/api/feedbacks/user/${userId}/project/${projectId}`,
    { params }
  );
  return data;
};

// Alternative method for getting feedbacks with query parameters (if needed)
export const getFeedbacks = async (
  userId?: number,
  projectId?: number,
  page: number = 0,
  size: number = 10,
  sort?: string
): Promise<PaginatedFeedbackResponse> => {
  const params: any = { page, size };

  if (userId) params.userId = userId;
  if (projectId) params.projectId = projectId;
  if (sort) params.sort = sort;

  const { data } = await axiosClient.get("/api/feedbacks", { params });
  return data;
};
