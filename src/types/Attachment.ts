export interface TreeNodeDto {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number | null;
  lastModified: string | null;
  attachmentId: number | null;
  fileType: string | null;
}

export interface AttachmentResponseDto {
  id: number;
  projectUpdateId: number;
  fileName: string;
  storagePath?: string;
  fileType: string;
  fileSize: number;
  fileSizeFormatted?: string;
  uploadedAt: string;
  logicalName: string;
  latestVersion: boolean;
  deleted: boolean;
}

export interface ProjectUpdateSummaryDto {
  id: number;
  summary: string | null;
  updateDate: string;
}

export interface FolderFileItem {
  file: File;
  relativePath: string;
}

export interface PresignedUrlResponse {
  url: string;
}
