// src/types/dto.ts

export interface TreeNodeDto {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number | null;
  lastModified: string | null;
  attachmentId: number | null;
  fileType: string | null; // <<--- THÊM TRƯỜNG NÀY (quan trọng cho logic "xem file")
}

export interface AttachmentResponseDto {
  id: number;
  projectUpdateId: number;
  fileName: string;
  storagePath?: string; // Giữ lại optional nếu có trường hợp không trả về
  fileType: string;    // MIME type của file
  fileSize: number;
  fileSizeFormatted?: string;
  uploadedAt: string; // Instant sẽ là string ISO 8601
  logicalName: string;
  latestVersion: boolean;
  deleted: boolean;
}

// === DTO MỚI CHO LỊCH SỬ PROJECT UPDATE ===
export interface ProjectUpdateSummaryDto {
  id: number; // ID của ProjectUpdate
  summary: string | null;
  updateDate: string; // LocalDate từ backend sẽ là string dạng "YYYY-MM-DD"
  // projectName?: string; // Tùy chọn nếu backend trả về
  // createdAt?: string; // Tùy chọn nếu bạn dùng createdAt
}


// --- Các interface mà bạn có thể đã dùng hoặc sẽ dùng ---

export interface FolderFileItem { // Đã có trong file api service, có thể chuyển vào đây
  file: File;
  relativePath: string;
}

export interface PresignedUrlResponse { // Đã có trong file api service, có thể chuyển vào đây
  url: string;
}

// Ví dụ các DTO khác nếu bạn có
// export interface ProjectResponseDto { /* ... */ }
// export interface UserResponseDto { /* ... */ }