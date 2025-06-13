import axiosClient from "./axiosClient";
import {
  AttachmentResponseDto,
  TreeNodeDto,
  FolderFileItem,
  PresignedUrlResponse,
  ProjectUpdateSummaryDto,
} from "../types/Attachment";
export type { FolderFileItem };
const API_ATTACHMENTS_BASE_PATH = "/api/attachments";
// Base path cho các API liên quan đến Project/ProjectUpdate (nếu khác)
// Dựa trên ProjectUpdateController của bạn, nó là /api/private/admin
const API_PROJECT_UPDATES_BASE_PATH = "/api/private/admin";

// --- Các hàm hiện tại (upload, get latest, soft delete, presigned URL) ---
// ... (giữ nguyên các hàm uploadSingleAttachment, uploadFolderAttachments,
// getLatestAttachmentsForProjectUpdate, getLatestAttachmentsForProject,
// softDeleteAttachmentsByLogicalName, getPresignedUrl) ...
export const uploadSingleAttachment = async (
  file: File,
  feedbackId: string,
  projectUpdateId: number | undefined,
  logicalName?: string
): Promise<AttachmentResponseDto> => {
  const formData = new FormData();
  formData.append("file", file);
  if (feedbackId !== undefined && feedbackId !== null) {
    formData.append("feedbackId", feedbackId);
  }
  // Chỉ append nếu projectUpdateId có giá trị hợp lệ
  if (projectUpdateId !== undefined && projectUpdateId !== null) {
    formData.append("projectUpdateId", projectUpdateId.toString());
  }
  if (logicalName) {
    formData.append("logicalName", logicalName);
  }
  const response = await axiosClient.post<AttachmentResponseDto>(
    `${API_ATTACHMENTS_BASE_PATH}/upload-single`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const uploadFolderAttachments = async (
  filesWithRelativePaths: FolderFileItem[],
  projectUpdateId: number
): Promise<{
  successfulUploads: AttachmentResponseDto[];
  uploadErrors: Array<{
    fileKey?: string;
    originalFilename?: string;
    logicalName?: string;
    error: string;
  }>;
  message?: string;
}> => {
  const formData = new FormData();
  formData.append("projectUpdateId", projectUpdateId.toString());
  for (const item of filesWithRelativePaths) {
    const encodedRelativePath = encodeURIComponent(item.relativePath);
    formData.append(encodedRelativePath, item.file, item.file.name);
  }
  const response = await axiosClient.post<any>(
    `${API_ATTACHMENTS_BASE_PATH}/upload-folder`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const getLatestAttachmentsForProjectUpdate = async (
  projectUpdateId: number
): Promise<AttachmentResponseDto[]> => {
  const response = await axiosClient.get<AttachmentResponseDto[]>(
    `${API_ATTACHMENTS_BASE_PATH}/project-update/${projectUpdateId}/latest`
  );
  return response.data;
};

export const getLatestAttachmentsForProject = async (
  projectId: number
): Promise<AttachmentResponseDto[]> => {
  const response = await axiosClient.get<AttachmentResponseDto[]>(
    `${API_ATTACHMENTS_BASE_PATH}/project/${projectId}/latest`
  );
  return response.data;
};

export const softDeleteAttachmentsByLogicalName = async (
  projectId: number,
  logicalName: string
): Promise<void> => {
  const encodedLogicalName = encodeURIComponent(logicalName);
  await axiosClient.delete(
    `${API_ATTACHMENTS_BASE_PATH}/project/${projectId}/logical-name/${encodedLogicalName}`
  );
};

export const getPresignedUrl = async (
  attachmentId: number,
  disposition: "inline" | "attachment" = "attachment"
): Promise<PresignedUrlResponse> => {
  const response = await axiosClient.get<PresignedUrlResponse>(
    `${API_ATTACHMENTS_BASE_PATH}/download-url/${attachmentId}`,
    { params: { disposition } }
  );
  return response.data;
};

export const getAwsUrl = async (
  storagePath: string,
  originalFileName: string,
  contentType: string
): Promise<PresignedUrlResponse> => {
  const response = await axiosClient.get<PresignedUrlResponse>(
    `${API_ATTACHMENTS_BASE_PATH}/get-url`,
    {
      params: {
        storagePath,
        originalFileName,
        contentType,
      },
    }
  );
  return response.data;
};

// --- Đổi tên các hàm lấy cây thư mục HIỆN TẠI của Project ---
/**
 * Retrieves the root directory structure for the CURRENT state of a specific project.
 *
 * @param projectId The ID of the project.
 * @returns A promise resolving to an array of TreeNodeDto objects.
 */
export const getCurrentProjectTreeRoot = async (
  // <<--- ĐỔI TÊN
  projectId: number
): Promise<TreeNodeDto[]> => {
  const response = await axiosClient.get<TreeNodeDto[]>(
    `${API_ATTACHMENTS_BASE_PATH}/project/${projectId}/tree` // Endpoint không đổi
  );
  return response.data;
};

/**
 * Retrieves the directory structure for a given path within the CURRENT state of a specific project.
 *
 * @param projectId The ID of the project.
 * @param path The relative path (e.g., "src/main/java"). Will be URL encoded.
 * @returns A promise resolving to an array of TreeNodeDto objects.
 */
export const getCurrentProjectTreeByPath = async (
  // <<--- ĐỔI TÊN
  projectId: number,
  path: string
): Promise<TreeNodeDto[]> => {
  if (!path || path === "/") {
    return getCurrentProjectTreeRoot(projectId); // Gọi hàm root nếu path rỗng
  }
  const encodedPath = encodeURIComponent(path);
  const response = await axiosClient.get<TreeNodeDto[]>(
    `${API_ATTACHMENTS_BASE_PATH}/project/${projectId}/tree/${encodedPath}` // Endpoint không đổi
  );
  return response.data;
};

// === CÁC HÀM MỚI CHO LỊCH SỬ VÀ SNAPSHOT ===

/**
 * Retrieves the history of project updates for a specific project.
 *
 * @param projectId The ID of the project.
 * @returns A promise resolving to an array of ProjectUpdateSummaryDto objects.
 */
export const getProjectUpdateHistory = async (
  projectId: number
): Promise<ProjectUpdateSummaryDto[]> => {
  const response = await axiosClient.get<ProjectUpdateSummaryDto[]>(
    // Sử dụng endpoint chính xác từ BE controller
    `${API_PROJECT_UPDATES_BASE_PATH}/projects/${projectId}/updates-history`
  );
  return response.data;
};

/**
 * Retrieves the root directory structure for a SNAPSHOT of a specific project update.
 *
 * @param projectUpdateId The ID of the project update.
 * @returns A promise resolving to an array of TreeNodeDto objects for that snapshot.
 */
export const getProjectUpdateSnapshotTreeRoot = async (
  projectUpdateId: number
): Promise<TreeNodeDto[]> => {
  const response = await axiosClient.get<TreeNodeDto[]>(
    `${API_ATTACHMENTS_BASE_PATH}/project-update/${projectUpdateId}/snapshot-tree`
  );
  return response.data;
};

/**
 * Retrieves the directory structure for a given path within a SNAPSHOT of a specific project update.
 *
 * @param projectUpdateId The ID of the project update.
 * @param path The relative path (e.g., "src/main/java"). Will be URL encoded.
 * @returns A promise resolving to an array of TreeNodeDto objects for that snapshot.
 */
export const getProjectUpdateSnapshotTreeByPath = async (
  projectUpdateId: number,
  path: string
): Promise<TreeNodeDto[]> => {
  if (!path || path === "/") {
    return getProjectUpdateSnapshotTreeRoot(projectUpdateId); // Gọi hàm root snapshot nếu path rỗng
  }
  const encodedPath = encodeURIComponent(path);
  const response = await axiosClient.get<TreeNodeDto[]>(
    `${API_ATTACHMENTS_BASE_PATH}/project-update/${projectUpdateId}/snapshot-tree/${encodedPath}`
  );
  return response.data;
};

// Cập nhật object export
const attachmentApi = {
  uploadSingleAttachment,
  uploadFolderAttachments,
  getLatestAttachmentsForProjectUpdate,
  getLatestAttachmentsForProject,
  softDeleteAttachmentsByLogicalName,
  getPresignedUrl,
  getCurrentProjectTreeRoot,
  getCurrentProjectTreeByPath,
  getProjectUpdateHistory,
  getProjectUpdateSnapshotTreeRoot,
  getProjectUpdateSnapshotTreeByPath,
};

export default attachmentApi;
