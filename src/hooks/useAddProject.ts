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
        name: values.name,
        description: values.description,
        type: values.projectType || values.type, // Map from projectType to type for API
        status: values.status,
        startDate: values.startDate,
        plannedEndDate: values.plannedEndDate,
        totalBudget: values.totalBudget,
        totalEstimatedHours: values.totalEstimatedHours ?? null,
        userIds: values.userIds || [],
        isActive: values.isActive !== undefined ? values.isActive : true, // Default to true
      };

      // Validation is now handled in createProjectApi
      await createProjectApi(payload);
      onSuccess();
      message.success("Project created successfully!");
    } catch (err: any) {
      console.error("Add project error:", err);
      message.error(
        `Failed to create project: ${err.message || "Unknown error"}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleAddProject };
};
