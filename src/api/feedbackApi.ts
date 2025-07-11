import dayjs from "dayjs";
import axiosClient from "./axiosClient";

export interface CreateFeedbackRequest {
  updateId?: number;
  projectId: string;
  userId: number;
  content: string;
}

export interface UpdateFeedbackRequest {
  projectId: string;
  userId: number;
  content: string;
}

export interface Feedback {
  id: string;
  updateId: number;
  projectId: string;
  userId: number;
  content: string;
  attachments?: FeedbackAttachment[];
  createdAt: string;
  read: boolean;
}

export interface FeedbackResponse {
  id: string;
  updateId: number;
  projectId: number; // Changed back to number to match actual API response
  projectName: string;
  userId: number;
  fullName: string;
  email: string;
  content: string;
  createdBy?: string | null; // Added missing field from API response
  attachments?: FeedbackAttachment[];
  createdAt: string;
  read: boolean;
  deleted?: boolean; // Added missing field from API response
}

export interface FeedbackAttachment {
  fileName: string;
  s3Key: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
}

export interface PaginatedFeedbackResponse {
  content: FeedbackResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export const createFeedback = async (
  feedbackData: CreateFeedbackRequest
): Promise<Feedback> => {
  const { data } = await axiosClient.post("/api/feedbacks", feedbackData);
  return data;
};

export const updateFeedback = async (
  id: string,
  feedbackData: UpdateFeedbackRequest
): Promise<Feedback> => {
  const { data } = await axiosClient.put(`/api/feedbacks/${id}`, feedbackData);
  return data;
};

export const deleteFeedback = async (id: string): Promise<void> => {
  await axiosClient.delete(`/api/feedbacks/${id}`);
};

export const markFeedbackAsRead = async (id: string): Promise<void> => {
  await axiosClient.patch(`/api/feedbacks/${id}/read`);
};

export const getFeedbackById = async (
  id: string
): Promise<FeedbackResponse> => {
  const { data } = await axiosClient.get(`/api/feedbacks/${id}`);
  return data;
};

export const getFeedbacksByUserAndProject = async (
  userId: number,
  projectId: string,
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

/**
 * @deprecated Use getAllFeedbacks instead for better security and role-based access control
 * This function has been removed as part of migration to the new secure endpoint.
 * The new getAllFeedbacks automatically filters based on user role and JWT token.
 */
// export const getFeedbacksByUser = async (
//   userId: number | undefined,
//   params: Record<string, any> = {}
// ): Promise<PaginatedFeedbackResponse> => {
//   console.warn("getFeedbacksByUser() is deprecated and has been removed. Please use getAllFeedbacks() instead for enhanced security.");
//   throw new Error("getFeedbacksByUser has been deprecated. Use getAllFeedbacks instead.");
// };

export interface FeedbackCriteria {
  updateId?: {
    equals?: number;
    in?: number[];
  };
  projectId?: {
    equals?: number; // Changed back to number to match actual API response format
    in?: number[];
  };
  read?: {
    equals?: boolean;
  };
  createdAt?: {
    equals?: string | dayjs.Dayjs | Date;
  };
  [key: string]: any;
}

/**
 * Get all feedbacks with enhanced security and role-based access control
 * Uses the new unified endpoint with automatic role-based filtering
 * @param criteria - Filter criteria for feedbacks
 * @param page - Page number (default: 0)
 * @param size - Page size (default: 10)
 * @param sortBy - Sort field (default: "createdAt")
 * @param direction - Sort direction (default: "desc")
 * @returns Promise<PaginatedFeedbackResponse>
 */
export const getAllFeedbacks = async (
  criteria: FeedbackCriteria = {},
  page: number = 0,
  size: number = 10,
  sortBy: string = "createdAt",
  direction: "asc" | "desc" = "desc"
): Promise<PaginatedFeedbackResponse> => {
  const criteriaParams = flattenCriteria(criteria);

  const params = {
    ...criteriaParams,
    page,
    size,
    sortBy,
    direction,
  };

  const { data } = await axiosClient.get("/api/feedbacks", { params });
  return data;
};

/**
 * @deprecated Use getAllFeedbacks instead for better security and role-based access control
 * Legacy filter function - kept for backward compatibility
 */
export const filter = async (
  criteria: FeedbackCriteria = {},
  page: number = 0,
  size: number = 10,
  sortBy: string = "createdAt",
  direction: "asc" | "desc" = "desc"
): Promise<PaginatedFeedbackResponse> => {
  console.warn("filter() is deprecated. Please use getAllFeedbacks() instead for enhanced security.");
  return getAllFeedbacks(criteria, page, size, sortBy, direction);
};

function flattenCriteria(criteria: FeedbackCriteria): Record<string, any> {
  const params: Record<string, any> = {};

  for (const key in criteria) {
    if (Object.prototype.hasOwnProperty.call(criteria, key)) {
      const valueAtKey = criteria[key]; // Đây là giá trị của criteria.key

      if (valueAtKey === undefined || valueAtKey === null) {
        continue;
      }

      if (dayjs.isDayjs(valueAtKey)) {
        params[key] = valueAtKey.toISOString();
      } else if (valueAtKey instanceof Date) {
        params[key] = valueAtKey.toISOString();
      } else if (typeof valueAtKey === "object" && !Array.isArray(valueAtKey)) {
        for (const operator in valueAtKey) {
          if (Object.prototype.hasOwnProperty.call(valueAtKey, operator)) {
            const paramKey = `${key}.${operator}`; // ví dụ: "createdAt.equals"
            let operatorValue = (valueAtKey as Record<string, any>)[operator];

            if (operatorValue === undefined || operatorValue === null) {
              continue;
            }

            if (typeof operatorValue === "object") {
              if (dayjs.isDayjs(operatorValue)) {
                params[paramKey] = operatorValue.toISOString();
              } else if (operatorValue instanceof Date) {
                params[paramKey] = operatorValue.toISOString();
              } else {
                params[paramKey] = operatorValue;
              }
            } else {
              params[paramKey] = operatorValue;
            }
          }
        }
      } else if (
        typeof valueAtKey === "string" ||
        typeof valueAtKey === "number" ||
        typeof valueAtKey === "boolean"
      ) {
        params[key] = valueAtKey;
      }
    }
  }
  return params;
}
