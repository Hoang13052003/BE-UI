import axiosClient from "./axiosClient"; // Đường dẫn đến file axiosClient của bạn
import { AttachmentResponseDto } from "../types/Attachment"; // Giả sử bạn có type này

const API_BASE_PATH = "/api/attachments"; // Hoặc path bạn đã đặt trong Controller

/**
 * Uploads a single attachment file.
 *
 * @param file The file to upload.
 * @param projectUpdateId The ID of the project update.
 * @param logicalName Optional logical name for the file. If not provided,
 *                    the original filename will be used by the backend.
 * @returns A promise resolving to the AttachmentResponseDto of the uploaded file.
 */
export const uploadSingleAttachment = async (
  file: File,
  projectUpdateId: number,
  logicalName?: string // logicalName là tùy chọn
): Promise<AttachmentResponseDto> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("projectUpdateId", projectUpdateId.toString());
  if (logicalName) {
    formData.append("logicalName", logicalName);
  }

  // Khi upload file, Content-Type phải là 'multipart/form-data'.
  // axios sẽ tự động set Content-Type này khi bạn truyền FormData.
  // Tuy nhiên, chúng ta cần override Content-Type mặc định ('application/json') của axiosClient.
  const response = await axiosClient.post<AttachmentResponseDto>(
    `${API_BASE_PATH}/upload-single`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data", // Quan trọng cho file upload
      },
    }
  );
  return response.data;
};

/**
 * Represents a file to be uploaded as part of a folder structure.
 */
export interface FolderFileItem {
  file: File;
  relativePath: string;
}

/**
 * Uploads multiple files, typically representing a folder structure.
 *
 * @param filesWithRelativePaths An array of objects, each containing a File object
 *                               and its relativePath string.
 * @param projectUpdateId The ID of the project update.
 * @returns A promise resolving to a list of AttachmentResponseDto for successfully uploaded files.
 */
export const uploadFolderAttachments = async (
  filesWithRelativePaths: FolderFileItem[],
  projectUpdateId: number
): Promise<AttachmentResponseDto[]> => {
  const formData = new FormData();
  formData.append("projectUpdateId", projectUpdateId.toString());

  for (const item of filesWithRelativePaths) {
    // Key của file part là relativePath đã được URL encode
    const encodedRelativePath = encodeURIComponent(item.relativePath);
    formData.append(encodedRelativePath, item.file, item.file.name); // item.file.name là tên gốc
  }

  const response = await axiosClient.post<AttachmentResponseDto[]>(
    `${API_BASE_PATH}/upload-folder`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data", // Quan trọng!
      },
      // Có thể thêm onUploadProgress nếu bạn muốn hiển thị tiến trình
      // onUploadProgress: (progressEvent) => {
      //   if (progressEvent.total) {
      //     const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      //     console.log(`Upload Progress: ${percentCompleted}%`);
      //   }
      // },
    }
  );

  return response.data;
};

export const getLatestAttachmentsForProjectUpdate = async (
  projectUpdateId: number
): Promise<AttachmentResponseDto[]> => {
  const response = await axiosClient.get<AttachmentResponseDto[]>(
    `${API_BASE_PATH}/project-update/${projectUpdateId}/latest`
  );
  return response.data;
};

/**
 * Retrieves a list of all latest versions of attachments for a specific project.
 *
 * @param projectId The ID of the project.
 * @returns A promise resolving to a list of AttachmentResponseDto.
 */
export const getLatestAttachmentsForProject = async (
  projectId: number
): Promise<AttachmentResponseDto[]> => {
  const response = await axiosClient.get<AttachmentResponseDto[]>(
    `${API_BASE_PATH}/project/${projectId}/latest`
  );
  return response.data;
};

/**
 * Soft-deletes all versions of an attachment identified by its logical name within a specific project.
 *
 * @param projectId The ID of the project.
 * @param logicalName The logical name (which can be a relative path) of the attachment to delete.
 *                    This name will be URL encoded before being sent in the path.
 * @returns A promise resolving to void on successful deletion.
 */
export const softDeleteAttachmentsByLogicalName = async (
  projectId: number,
  logicalName: string
): Promise<void> => {
  const encodedLogicalName = encodeURIComponent(logicalName); // Quan trọng: encode logicalName
  await axiosClient.delete(
    `${API_BASE_PATH}/project/${projectId}/logical-name/${encodedLogicalName}`
  );
};

/**
 * Interface for the Presigned URL response from the backend.
 */
export interface PresignedUrlResponse {
  url: string;
  // Bạn có thể thêm các trường khác nếu backend trả về, ví dụ: expiresIn
}

/**
 * Gets a presigned URL for downloading a specific attachment.
 *
 * @param attachmentId The ID of the attachment.
 * @returns A promise resolving to an object containing the presigned URL.
 */
export const getPresignedUrlForDownload = async (
  attachmentId: number
): Promise<PresignedUrlResponse> => {
  const response = await axiosClient.get<PresignedUrlResponse>(
    `${API_BASE_PATH}/download-url/${attachmentId}`
  );
  return response.data;
};
const attachmentApi = {
  uploadSingleAttachment,
  uploadFolderAttachments,
  getLatestAttachmentsForProjectUpdate,
  getLatestAttachmentsForProject,
  softDeleteAttachmentsByLogicalName,
  getPresignedUrlForDownload,
};
export default attachmentApi;