import { useState, useCallback } from "react";
import { message } from "antd";
import {
  BatchUpdateMilestoneItemDTO,
  batchUpdateMilestonesApi,
} from "../api/milestoneApi";
import { Milestone } from "../types/milestone";

interface UseInlineEditMilestoneProps {
  milestones: Milestone[];
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
  onRefreshData: () => void;
}

export const useInlineEditMilestone = ({
  setMilestones,
  onRefreshData,
}: UseInlineEditMilestoneProps) => {
  const [editedData, setEditedData] = useState<
    Record<number, Partial<BatchUpdateMilestoneItemDTO>>
  >({});
  const [batchSaving, setBatchSaving] = useState<boolean>(false);

  const handleInlineEdit = useCallback(
    (
      milestoneId: number,
      field: keyof BatchUpdateMilestoneItemDTO,
      value: any
    ) => {
      setEditedData((prev) => ({
        ...prev,
        [milestoneId]: {
          ...prev[milestoneId],
          id: milestoneId,
          [field]: value,
        },
      }));

      setMilestones((prevMilestones) =>
        prevMilestones.map((milestone) => {
          if (milestone.id === milestoneId) {
            return { ...milestone, [field]: value };
          }
          return milestone;
        })
      );
    },
    [setMilestones]
  );

  const handleBatchSave = useCallback(async () => {
    const changesToSubmit: BatchUpdateMilestoneItemDTO[] = Object.values(
      editedData
    ).filter((item): item is BatchUpdateMilestoneItemDTO => {
      return item.id !== undefined && Object.keys(item).length > 1;
    });

    if (changesToSubmit.length === 0) {
      message.info("No changes to save.");
      return;
    }
    setBatchSaving(true);
    try {
      await batchUpdateMilestonesApi(changesToSubmit);
      message.success(
        `${changesToSubmit.length} milestone(s) updated successfully!`
      );
      setEditedData({});
      onRefreshData();
    } catch (err: any) {
      console.error("Error batch saving milestones:", err);

      if (err.response?.status === 400) {
        message.error(
          "Validation error: Please check all fields or ensure this is a FIXED_PRICE project."
        );
      } else if (err.response?.status === 404) {
        message.error(
          "Some milestones were not found. Please refresh and try again."
        );
      } else if (err instanceof Error) {
        message.error(err.message);
      } else {
        message.error("Failed to save changes.");
      }
    } finally {
      setBatchSaving(false);
    }
  }, [editedData, onRefreshData]);

  const handleMarkSelectedAsCompleted = useCallback(
    async (selectedRowKeys: React.Key[]) => {
      if (selectedRowKeys.length === 0) {
        message.info("Please select milestones to mark as completed.");
        return;
      }

      const currentDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
      const updates: BatchUpdateMilestoneItemDTO[] = selectedRowKeys.map(
        (key) => ({
          id: Number(key),
          completionDate: currentDate,
          completionPercentage: 100,
          status: "COMPLETED" as const,
        })
      );
      setBatchSaving(true);
      try {
        await batchUpdateMilestonesApi(updates);
        message.success(`${updates.length} milestone(s) marked as completed!`);
        onRefreshData();
      } catch (err: any) {
        console.error("Error marking milestones as completed:", err);

        if (err.response?.status === 400) {
          message.error(
            "Cannot mark as completed: Please ensure this is a FIXED_PRICE project."
          );
        } else if (err.response?.status === 404) {
          message.error(
            "Some milestones were not found. Please refresh and try again."
          );
        } else if (err instanceof Error) {
          message.error(err.message);
        } else {
          message.error("Failed to mark as completed.");
        }
      } finally {
        setBatchSaving(false);
      }
    },
    [onRefreshData]
  );

  const resetEditedData = useCallback(() => {
    setEditedData({});
  }, []);

  const hasUnsavedChanges = Object.keys(editedData).length > 0;

  return {
    editedData,
    batchSaving,
    hasUnsavedChanges,
    handleInlineEdit,
    handleBatchSave,
    handleMarkSelectedAsCompleted,
    resetEditedData,
  };
};
