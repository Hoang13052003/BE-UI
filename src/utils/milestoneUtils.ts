import { MilestoneStatus } from "../types/milestone";

/**
 * Get display name for milestone status based on backend enum
 */
export const getMilestoneStatusDisplayName = (status: MilestoneStatus): string => {
  switch (status) {
    case "TODO":
      return "To Do";
    case "DOING":
      return "Doing";
    case "PENDING":
      return "Pending";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
};

/**
 * Get color for milestone status
 */
export const getMilestoneStatusColor = (status: MilestoneStatus | null): string => {
  switch (status) {
    case "TODO":
      return "#d9d9d9"; // Gray
    case "DOING":
      return "#1890ff"; // Blue
    case "PENDING":
      return "#faad14"; // Orange
    case "COMPLETED":
      return "#52c41a"; // Green
    default:
      return "#d9d9d9"; // Gray
  }
};

/**
 * Get tag color for milestone status (for Ant Design Tag component)
 */
export const getMilestoneStatusTagColor = (status: MilestoneStatus | null): string => {
  switch (status) {
    case "TODO":
      return "default";
    case "DOING":
      return "processing";
    case "PENDING":
      return "warning";
    case "COMPLETED":
      return "success";
    default:
      return "default";
  }
};
