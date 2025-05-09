import axiosClient from "./axiosClient";

export interface Update {
  id?: string;
  projectId: string;
  date: Date;
  content: string;
  status: "on_track" | "delayed" | "completed";
  files?: string[];
  internalNote?: string;
  isPublished: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

const updateApi = {
  getAllUpdates: (): Promise<ApiResponse<Update[]>> => {
    const url = "/updates";
    return axiosClient.get(url);
  },
  createUpdate: (updateData: Update): Promise<ApiResponse<Update>> => {
    const url = "/updates";
    const formData = new FormData();
    formData.append("projectId", updateData.projectId);
    formData.append("date", updateData.date.toISOString());
    formData.append("content", updateData.content);
    formData.append("status", updateData.status);
    formData.append("isPublished", String(updateData.isPublished));
    if (updateData.internalNote) {
      formData.append("internalNote", updateData.internalNote);
    }
    if (updateData.files) {
      updateData.files.forEach((file) => {
        formData.append("files", file);
      });
    }
    return axiosClient.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  updateUpdate: (
    updateId: string,
    updateData: Update
  ): Promise<ApiResponse<Update>> => {
    const url = `/updates/${updateId}`;
    const formData = new FormData();
    formData.append("projectId", updateData.projectId);
    formData.append("date", updateData.date.toISOString());
    formData.append("content", updateData.content);
    formData.append("status", updateData.status);
    formData.append("isPublished", String(updateData.isPublished));
    if (updateData.internalNote) {
      formData.append("internalNote", updateData.internalNote);
    }
    if (updateData.files) {
      updateData.files.forEach((file) => {
        formData.append("files", file);
      });
    }
    return axiosClient.put(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteUpdate: (updateId: string): Promise<ApiResponse<void>> => {
    const url = `/updates/${updateId}`;
    return axiosClient.delete(url);
  },

  getUpdatesByProject: (projectId: string): Promise<ApiResponse<Update[]>> => {
    const url = `/projects/${projectId}/updates`;
    return axiosClient.get(url);
  },
  getUpdateDetail: (updateId: string): Promise<ApiResponse<Update>> => {
    const url = `/updates/${updateId}`;
    return axiosClient.get(url);
  },
};

export default updateApi;
