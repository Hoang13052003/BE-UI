//get form api
export interface ProjectUser {
  id: number;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  type: "FIXED_PRICE" | "LABOR"; // Updated enum values
  status: "NEW" | "PENDING" | "PROGRESS" | "CLOSED"; // Updated enum values
  startDate: string; // Format: "YYYY-MM-DD"
  plannedEndDate: string; // Format: "YYYY-MM-DD"
  actualEndDate: string | null; // Format: "YYYY-MM-DD" (can be null)
  totalBudget: number;
  totalActualHours: number;
  totalEstimatedHours: number | null; // Updated to allow null based on sample data
  progress: number;
  users: ProjectUser[]; // List of users assigned to the project
  totalMilestoneCompleted: number;
  milestoneCount: number;
  newMilestoneCount: number;
  sentMilestoneCount: number;
  reviewedMilestoneCount: number;
  updatedAt: Date; // Format: "YYYY-MM-DD HH:mm:ss"
}

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
}

export interface ProjectDetail { // ĐỔI TÊN TỪ Project thành ProjectDetail cho rõ ràng
  id: number;
  name: string;
  description: string | null; // Cho phép null nếu backend có thể trả về null
  type: "FIXED_PRICE" | "LABOR";
  status: "NEW" | "PENDING" | "PROGRESS" | "CLOSED";
  startDate: string; // Format: "YYYY-MM-DD"
  plannedEndDate: string; // Format: "YYYY-MM-DD"
  actualEndDate: string | null;
  totalBudget: number | null; // Cho phép null nếu có thể
  totalEstimatedHours: number | null;
  users: UserSummary[]; 

}

export interface ProjectUpdateTimelineItem {
  id: number;
  createdBy: UserSummary; // Thông tin người tạo cập nhật
  updateDate: string; // Format: "YYYY-MM-DD"
  summary: string | null;
  details: string | null;
  statusAtUpdate: string | null; // TODO: Định nghĩa enum cho UpdateStatusEnum nếu cần
  completionPercentage: number | null;
  published: boolean;
  // attachments?: AttachmentSummary[]; // Nếu sau này có hiển thị attachments
}

export interface ProjectContextTimeLog { // Đặt tên khác để phân biệt với TimeLogResponseDTO cũ nếu có
  id: number;
  performer: UserSummary;
  taskDate: string;
  taskDescription: string;
  hoursSpent: number;
}

export interface SortInfo { // Thông tin sắp xếp
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

export interface PageableInfo { // Thông tin của đối tượng "pageable"
  sort: SortInfo;
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

export interface ApiPage<T> {
  content: T[];
  pageable: PageableInfo; // << Sử dụng PageableInfo
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;         // Số trang hiện tại (0-indexed)
  sort: SortInfo;           // << Sử dụng SortInfo cho sort ở cấp ngoài
  first: boolean;
  numberOfElements: number; // Số phần tử trong trang hiện tại
  empty: boolean;
}