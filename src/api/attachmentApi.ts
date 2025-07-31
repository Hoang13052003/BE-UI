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
const API_PROJECT_UPDATES_BASE_PATH = "/api/private/admin";

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
  projectId: string
): Promise<AttachmentResponseDto[]> => {
  const response = await axiosClient.get<AttachmentResponseDto[]>(
    `${API_ATTACHMENTS_BASE_PATH}/project/${projectId}/latest`
  );
  return response.data;
};

export const softDeleteAttachmentsByLogicalName = async (
  projectId: string,
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

export const getCurrentProjectTreeRoot = async (
  projectId: string
): Promise<TreeNodeDto[]> => {
  const response = await axiosClient.get<TreeNodeDto[]>(
    `${API_ATTACHMENTS_BASE_PATH}/project/${projectId}/tree`
  );
  return response.data;
};

export const getCurrentProjectTreeByPath = async (
  projectId: string,
  path: string
): Promise<TreeNodeDto[]> => {
  if (!path || path === "/") {
    return getCurrentProjectTreeRoot(projectId);
  }
  const encodedPath = encodeURIComponent(path);
  const response = await axiosClient.get<TreeNodeDto[]>(
    `${API_ATTACHMENTS_BASE_PATH}/project/${projectId}/tree/${encodedPath}`
  );
  return response.data;
};

export const getProjectUpdateHistory = async (
  projectId: string
): Promise<ProjectUpdateSummaryDto[]> => {
  const response = await axiosClient.get<ProjectUpdateSummaryDto[]>(
    `${API_PROJECT_UPDATES_BASE_PATH}/projects/${projectId}/updates-history`
  );
  return response.data;
};

// New endpoint for Project Labor (dự án tính theo thời gian)
export const getProjectLaborUpdateHistory = async (
  projectLaborId: string
): Promise<ProjectUpdateSummaryDto[]> => {
  const response = await axiosClient.get<ProjectUpdateSummaryDto[]>(
    `${API_PROJECT_UPDATES_BASE_PATH}/project-labor/${projectLaborId}/updates-history`
  );
  return response.data;
};

// New endpoint for Project Fixed Price (dự án tính theo milestone)
export const getProjectFixedPriceUpdateHistory = async (
  projectFixedPriceId: string
): Promise<ProjectUpdateSummaryDto[]> => {
  const response = await axiosClient.get<ProjectUpdateSummaryDto[]>(
    `${API_PROJECT_UPDATES_BASE_PATH}/project-fixed-price/${projectFixedPriceId}/updates-history`
  );
  return response.data;
};

// Generic function to get project update history based on project type
export const getProjectUpdateHistoryByType = async (
  projectId: string,
  projectType: "LABOR" | "FIXED_PRICE"
): Promise<ProjectUpdateSummaryDto[]> => {
  if (projectType === "LABOR") {
    return getProjectLaborUpdateHistory(projectId);
  } else {
    return getProjectFixedPriceUpdateHistory(projectId);
  }
};

export const getProjectUpdateSnapshotTreeRoot = async (
  projectUpdateId: number
): Promise<TreeNodeDto[]> => {
  const response = await axiosClient.get<TreeNodeDto[]>(
    `${API_ATTACHMENTS_BASE_PATH}/project-update/${projectUpdateId}/snapshot-tree`
  );
  return response.data;
};

export const getProjectUpdateSnapshotTreeByPath = async (
  projectUpdateId: number,
  path: string
): Promise<TreeNodeDto[]> => {
  if (!path || path === "/") {
    return getProjectUpdateSnapshotTreeRoot(projectUpdateId);
  }
  const encodedPath = encodeURIComponent(path);
  const response = await axiosClient.get<TreeNodeDto[]>(
    `${API_ATTACHMENTS_BASE_PATH}/project-update/${projectUpdateId}/snapshot-tree/${encodedPath}`
  );
  return response.data;
};

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
  getProjectLaborUpdateHistory,
  getProjectFixedPriceUpdateHistory,
  getProjectUpdateHistoryByType,
  getProjectUpdateSnapshotTreeRoot,
  getProjectUpdateSnapshotTreeByPath,
};

export default attachmentApi;
