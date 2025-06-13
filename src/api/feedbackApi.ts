import dayjs from "dayjs";
import axiosClient from "./axiosClient";

export interface Feedback {
  id: string;
  updateId: number;
  projectId: number;
  userId: number;
  content: string;
  attachments?: FeedbackAttachment[];
  createdAt: string;
  read: boolean;
}

export interface FeedbackResponse {
  id: string;
  updateId: number;
  projectId: number;
  projectName: string;
  userId: number;
  fullName: string;
  email: string;
  content: string;
  attachments?: FeedbackAttachment[];
  createdAt: string;
  read: boolean;
}

export interface FeedbackAttachment {
  fileName: string;
  s3Key: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadedAt: string;
}

export interface CreateFeedbackRequest {
  updateId?: number;
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

export const markFeedbackAsRead = async (id: string): Promise<void> => {
  await axiosClient.patch(`/api/feedbacks/${id}/read`);
};

// Get feedback by ID
export const getFeedbackById = async (
  id: string
): Promise<FeedbackResponse> => {
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

export const getFeedbacksByUser = async (
  userId: number | undefined,
  params: Record<string, any> = {}
): Promise<PaginatedFeedbackResponse> => {
  const { data } = await axiosClient.get(`/api/feedbacks/user/${userId}`, {
    params,
  });
  return data;
};

// Alternative method for getting feedbacks with query parameters (if needed)
export interface FeedbackCriteria {
  updateId?: {
    equals?: number;
    in?: number[];
  };
  projectId?: {
    equals?: number;
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

export const filter = async (
  criteria: FeedbackCriteria = {},
  page: number = 0,
  size: number = 10,
  sortBy: string = "createdAt",
  direction: "asc" | "desc" = "desc"
): Promise<PaginatedFeedbackResponse> => {
  console.log(
    "--- BẮT ĐẦU filter --- criteria ban đầu:",
    JSON.stringify(criteria, null, 2)
  ); // LOG 6
  const criteriaParams = flattenCriteria(criteria);

  const params = {
    ...criteriaParams,
    page,
    size,
    sortBy,
    direction,
  };

  console.log(
    "!!! FINAL PARAMS TRƯỚC KHI GỌI AXIOS:",
    JSON.stringify(params, null, 2)
  );
  const { data } = await axiosClient.get("/api/feedbacks", { params });
  return data;
};

// Hàm flattenCriteria ĐÃ SỬA LỖI
function flattenCriteria(criteria: FeedbackCriteria): Record<string, any> {
  const params: Record<string, any> = {};
  console.log(
    "--- FLATTENCRITERIA NHẬN ĐẦU VÀO ---",
    JSON.stringify(criteria, null, 2)
  );

  for (const key in criteria) {
    if (Object.prototype.hasOwnProperty.call(criteria, key)) {
      const valueAtKey = criteria[key]; // Đây là giá trị của criteria.key

      if (valueAtKey === undefined || valueAtKey === null) {
        continue;
      }

      if (dayjs.isDayjs(valueAtKey)) {
        params[key] = valueAtKey.toISOString();
        console.log(
          `[flattenCriteria] Đã chuyển ${key} (Day.js trực tiếp) thành ISO: ${params[key]}`
        );
      } else if (valueAtKey instanceof Date) {
        params[key] = valueAtKey.toISOString();
        console.log(
          `[flattenCriteria] Đã chuyển ${key} (Date trực tiếp) thành ISO: ${params[key]}`
        );
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
                console.log(
                  `[flattenCriteria] Đã chuyển ${paramKey} (Day.js trong toán tử) thành ISO: ${params[paramKey]}`
                );
              } else if (operatorValue instanceof Date) {
                params[paramKey] = operatorValue.toISOString();
                console.log(
                  `[flattenCriteria] Đã chuyển ${paramKey} (Date trong toán tử) thành ISO: ${params[paramKey]}`
                );
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
        console.log(
          `[flattenCriteria] Giữ nguyên giá trị đơn giản cho ${key}: ${params[key]}`
        );
      }
    }
  }
  console.log(
    "--- FLATTENCRITERIA TRẢ VỀ ---",
    JSON.stringify(params, null, 2)
  );
  return params;
}
