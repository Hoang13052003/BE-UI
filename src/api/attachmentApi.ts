import axiosClient from "./axiosClient";
import { AttachmentResponseDto, TreeNodeDto } from "../types/Attachment";

const API_BASE_PATH = "/api/attachments";

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
  logicalName?: string
): Promise<AttachmentResponseDto> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("projectUpdateId", projectUpdateId.toString());
  if (logicalName) {
    formData.append("logicalName", logicalName);
  }

  const response = await axiosClient.post<AttachmentResponseDto>(
    `${API_BASE_PATH}/upload-single`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
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
 * The backend expects the relativePath to be the key in FormData, URL encoded.
 *
 * @param filesWithRelativePaths An array of objects, each containing a File object
 *                               and its relativePath string (e.g., "src/main/App.java").
 * @param projectUpdateId The ID of the project update.
 * @returns A promise resolving to an object containing successfulUploads and uploadErrors.
 */
export const uploadFolderAttachments = async (
  filesWithRelativePaths: FolderFileItem[],
  projectUpdateId: number
): Promise<{
  successfulUploads: AttachmentResponseDto[];
  uploadErrors: Array<{ fileKey?: string; originalFilename?: string; logicalName?: string; error: string }>;
  message?: string;
}> => {
  const formData = new FormData();
  formData.append("projectUpdateId", projectUpdateId.toString());

  for (const item of filesWithRelativePaths) {
    // Key của file part là relativePath đã được URL encode
    const encodedRelativePath = encodeURIComponent(item.relativePath);
    formData.append(encodedRelativePath, item.file, item.file.name);
  }

  const response = await axiosClient.post<any>(
    `${API_BASE_PATH}/upload-folder`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
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
  const encodedLogicalName = encodeURIComponent(logicalName);
  await axiosClient.delete(
    `${API_BASE_PATH}/project/${projectId}/logical-name/${encodedLogicalName}`
  );
};

/**
 * Interface for the Presigned URL response from the backend.
 */
export interface PresignedUrlResponse {
  url: string;
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

// === CÁC HÀM MỚI CHO API CÂY THƯ MỤC ===

/**
 * Retrieves the root directory structure for a specific project.
 *
 * @param projectId The ID of the project.
 * @returns A promise resolving to an array of TreeNodeDto objects.
 */
export const getProjectTreeRoot = async (
  projectId: number
): Promise<TreeNodeDto[]> => {
  const response = await axiosClient.get<TreeNodeDto[]>(
    `${API_BASE_PATH}/project/${projectId}/tree`
  );
  return response.data;
};

/**
 * Retrieves the directory structure for a given path within a specific project.
 *
 * @param projectId The ID of the project.
 * @param path The relative path within the project (e.g., "src/main/java").
 *             This path should NOT be URL encoded by the caller; the function will handle encoding.
 * @returns A promise resolving to an array of TreeNodeDto objects.
 */
export const getProjectTreeByPath = async (
  projectId: number,
  path: string
): Promise<TreeNodeDto[]> => {
  // Path rỗng hoặc chỉ "/" nên được xử lý như gọi getProjectTreeRoot hoặc backend xử lý path rỗng
  if (!path || path === "/") {
    // Nếu path rỗng hoặc root, gọi API root thay vì endpoint có path
    return getProjectTreeRoot(projectId);
  }

  const encodedPath = encodeURIComponent(path);
  const response = await axiosClient.get<TreeNodeDto[]>(
    `${API_BASE_PATH}/project/${projectId}/tree/${encodedPath}`
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
  getProjectTreeRoot,
  getProjectTreeByPath,
};

export default attachmentApi;