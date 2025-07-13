import { useState } from "react";
import { createProjectApi } from "../api/projectApi";
import { ProjectRequest } from "../types/ProjectRequest";
import { showNotification, showError } from "../utils/notificationUtils";

export const useAddProject = (onSuccess: () => void) => {
  const [submitting, setSubmitting] = useState(false);

  const handleAddProject = async (values: any) => {
    setSubmitting(true);
    try {
      const payload: ProjectRequest = {
        projectName: values.projectName || values.name, // Support both field names during transition
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
      // Note: Success notification is handled by the parent component to avoid duplication
    } catch (err: any) {
      console.error("Add project error:", err);
      showError(err, "PROJECT_CREATE_FAILED");
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleAddProject };
};
