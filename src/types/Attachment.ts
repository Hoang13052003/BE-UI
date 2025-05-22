// src/types/dto.ts

export interface AttachmentResponseDto {
  id: number;
  projectUpdateId: number;
  fileName: string;
  storagePath?: string;
  fileType: string;
  fileSize: number;
  fileSizeFormatted?: string; // Optional
  uploadedAt: string;
  // uploadedAtFormatted?: string; // Optional

  // Các trường mới cho versioning
  logicalName: string;
  latestVersion: boolean;
  deleted: boolean;

  // createdAt?: string;
  // createdBy?: string;
  // updatedAt?: string;
  // updatedBy?: string;
}

// export interface ProjectResponseDto { /* ... */ }
// export interface UserResponseDto { /* ... */ }