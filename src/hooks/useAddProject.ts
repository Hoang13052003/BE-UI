import { useState } from "react";
import { createProjectApi } from "../api/projectApi";
import { ProjectRequest } from "../types/ProjectRequest";
import { message } from "antd";

export const useAddProject = (onSuccess: () => void) => {
  const [submitting, setSubmitting] = useState(false);

  const handleAddProject = async (values: any) => {
    setSubmitting(true);
    try {
      const payload: ProjectRequest = {
        ...values,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        plannedEndDate: values.plannedEndDate?.format("YYYY-MM-DD"),
        totalEstimatedHours: values.totalEstimatedHours ?? null,
      };
      if (!payload.startDate || !payload.plannedEndDate) {
        throw new Error("Ngày bắt đầu hoặc ngày kết thúc không hợp lệ.");
      }

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