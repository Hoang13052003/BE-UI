import axiosClient from "./axiosClient";

export interface Feedback {
  id: number;
  projectId: number;
  projectName: string;
  message: string;
  createdAt: string;
  createdBy: number;
  createdByName: string;
  isRead: boolean;
}

export interface FeedbackResponse {
  feedback: Feedback[];
  total: number;
}

// Get all feedback with pagination and filters
export const getAllFeedback = async (
  page: number = 1,
  limit: number = 10,
  projectId?: number,
  isRead?: boolean
): Promise<FeedbackResponse> => {
  const params = { page, limit, projectId, isRead };
  const { data } = await axiosClient.get("/api/private/admin/feedback", {
    params,
  });
  return data;
};

// Get recent feedback (limited number)
export const getRecentFeedback = async (
  limit: number = 5
): Promise<Feedback[]> => {
  const params = { limit };
  const { data } = await axiosClient.get("/api/private/admin/feedback/recent", {
    params,
  });
  return data;
};

// Mark feedback as read
export const markFeedbackAsRead = async (id: number): Promise<void> => {
  await axiosClient.patch(`/api/private/admin/feedback/${id}/read`);
};

// Mark all feedback as read
export const markAllFeedbackAsRead = async (): Promise<void> => {
  await axiosClient.patch("/api/private/admin/feedback/read-all");
};

// Add new feedback
export const addFeedback = async (
  projectId: number,
  message: string
): Promise<Feedback> => {
  const { data } = await axiosClient.post("/api/private/admin/feedback", {
    projectId,
    message,
  });
  return data;
};

// Delete feedback
export const deleteFeedback = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/private/admin/feedback/${id}`);
};
