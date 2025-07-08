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

export const isMilestoneCompleted = (milestone: { completionDate?: string | null }): boolean => {
  return (
    milestone.completionDate !== null &&
    milestone.completionDate !== undefined &&
    milestone.completionDate !== ""
  );
};

export const isOverdueMilestone = (milestone: { deadlineDate?: string | null, completionDate?: string | null }): boolean => {
  if (!milestone.deadlineDate) return false;
  const deadlineDate = new Date(milestone.deadlineDate);
  const completed = isMilestoneCompleted(milestone);
  if (completed) {
    const completionDate = new Date(milestone.completionDate!);
    const deadlineEndOfDay = new Date(deadlineDate);
    deadlineEndOfDay.setHours(23, 59, 59, 999);
    return completionDate > deadlineEndOfDay;
  } else {
    const currentDate = new Date();
    const deadlineEndOfDay = new Date(deadlineDate);
    deadlineEndOfDay.setHours(23, 59, 59, 999);
    return currentDate > deadlineEndOfDay;
  }
};

export const calculateMilestoneStats = (milestones: Array<{ status?: string, completionDate?: string | null, deadlineDate?: string | null }>) => {
  const total = milestones.length;
  const completed = milestones.filter((m) => isMilestoneCompleted(m)).length;
  const inProgress = milestones.filter(
    (m) => !isMilestoneCompleted(m) && (m.status === "TODO" || m.status === "DOING")
  ).length;
  const overdue = milestones.filter((m) => isOverdueMilestone(m)).length;
  return { total, completed, inProgress, overdue };
};
