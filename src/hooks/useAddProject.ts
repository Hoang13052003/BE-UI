import { useState } from "react";
import { createProjectApi } from "../api/projectApi";
import { ProjectRequest } from "../types/ProjectRequest"; // Sử dụng ProjectRequest đã được cập nhật
import { message } from "antd";

export const useAddProject = (onSuccess: () => void) => {
  const [submitting, setSubmitting] = useState(false);

  const handleAddProject = async (values: any) => {
    setSubmitting(true);
    try {
      const payload: ProjectRequest = {
        name: values.name,
        description: values.description,
        type: values.type,
        status: values.status,
        startDate: values.startDate, // Đã được format từ AddProjectModal
        plannedEndDate: values.plannedEndDate, // Đã được format từ AddProjectModal
        totalBudget: values.totalBudget,
        totalEstimatedHours: values.totalEstimatedHours ?? null,
        userIds: values.userIds || [], // Lấy từ values do AddProjectModal cung cấp
      };

      if (!payload.startDate || !payload.plannedEndDate) {
        throw new Error("Ngày bắt đầu hoặc ngày kết thúc không hợp lệ.");
      }
      // Optional: Validate userIds if it's mandatory
      // if (!payload.userIds || payload.userIds.length === 0) {
      //   throw new Error("Please assign at least one user to the project.");
      // }

      await createProjectApi(payload);
      onSuccess();
      message.success("Tạo dự án thành công!");
    } catch (err: any) {
      console.error("Add project error:", err);
      message.error(`Tạo dự án thất bại: ${err.message || "Lỗi không xác định"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleAddProject };
};