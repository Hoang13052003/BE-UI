import { TimelogStatusType } from "../api/timelogApi";
import dayjs from "dayjs";

export const getTimelogStatusDisplayName = (status: TimelogStatusType): string => {
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
 * Get color for timelog status
 */
export const getTimelogStatusColor = (status: TimelogStatusType | null): string => {
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
 * Get tag color for timelog status (for Ant Design Tag component)
 */
export const getTimelogStatusTagColor = (status: TimelogStatusType | null): string => {
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

export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}m`;
  } else if (hours === Math.floor(hours)) {
    return `${hours}h`;
  } else {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }
}

export function calculateTimelogStats(timelogs: Array<{ hoursSpent: number; performerFullName?: string; taskDate?: string }>) {
  const totalHours = timelogs.reduce((sum, log) => sum + log.hoursSpent, 0);
  const uniqueUsers = new Set(
    timelogs.map((log) => log.performerFullName || "N/A")
  ).size;
  const thisWeekLogs = timelogs.filter((log) =>
    log.taskDate ? dayjs(log.taskDate).isAfter(dayjs().startOf("week")) : false
  ).length;
  return { totalHours, uniqueUsers, thisWeekLogs };
}
