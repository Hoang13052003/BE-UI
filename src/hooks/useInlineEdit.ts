import { useState, useCallback } from "react";
import { message } from "antd";
import {
  TimeLogResponse,
  BatchUpdateItem,
  batchUpdateTimeLogsApi,
  TimelogStatusType,
} from "../api/timelogApi";
import { UserIdAndEmailResponse } from "../types/User";

interface UseInlineEditProps {
  timelogs: TimeLogResponse[];
  setTimelogs: React.Dispatch<React.SetStateAction<TimeLogResponse[]>>;
  searchedUsers: (UserIdAndEmailResponse & { fullName?: string })[];
  currentPerformersMap: Record<
    number,
    UserIdAndEmailResponse & { fullName?: string }
  >;
  setCurrentPerformersMap: React.Dispatch<
    React.SetStateAction<
      Record<number, UserIdAndEmailResponse & { fullName?: string }>
    >
  >;
  onRefreshData: () => void;
}

export const useInlineEdit = ({
  setTimelogs,
  searchedUsers,
  currentPerformersMap,
  setCurrentPerformersMap,
  onRefreshData,
}: UseInlineEditProps) => {
  const [editedData, setEditedData] = useState<
    Record<number, Partial<BatchUpdateItem>>
  >({});
  const [batchSaving, setBatchSaving] = useState<boolean>(false);

  const handleInlineEdit = useCallback(
    (timelogId: number, field: keyof BatchUpdateItem, value: any) => {
      setEditedData((prev) => ({
        ...prev,
        [timelogId]: {
          ...prev[timelogId],
          id: timelogId,
          [field]: value,
        },
      }));

      if (field === "performerId") {
        const selectedUser =
          searchedUsers.find((u) => u.id === value) ||
          currentPerformersMap[timelogId];
        if (selectedUser) {
          setTimelogs((prevLogs) =>
            prevLogs.map((log) => {
              if (log.id === timelogId) {
                return {
                  ...log,
                  performer: {
                    id: selectedUser.id,
                    fullName: selectedUser.fullName || selectedUser.email,
                    email: selectedUser.email,
                  },
                };
              }
              return log;
            })
          );
          setCurrentPerformersMap((prev) => ({
            ...prev,
            [timelogId]: {
              id: selectedUser.id,
              email: selectedUser.email,
              fullName: selectedUser.fullName || selectedUser.email,
            },
          }));
        }
      } else {
        setTimelogs((prevLogs) =>
          prevLogs.map((log) => {
            if (log.id === timelogId) {
              return { ...log, [field]: value };
            }
            return log;
          })
        );
      }
    },
    [searchedUsers, currentPerformersMap, setTimelogs, setCurrentPerformersMap]
  );

  const handleBatchSave = useCallback(async () => {
    const changesToSubmit: BatchUpdateItem[] = Object.values(editedData).filter(
      (item): item is BatchUpdateItem =>
        item.id !== undefined && Object.keys(item).length > 1
    );

    if (changesToSubmit.length === 0) {
      message.info("No changes to save.");
      return;
    }

    setBatchSaving(true);
    try {
      await batchUpdateTimeLogsApi(changesToSubmit);
      message.success(
        `${changesToSubmit.length} time log(s) updated successfully!`
      );
      setEditedData({});
      onRefreshData();
    } catch (err) {
      console.error("Error batch saving time logs:", err);
      if (err instanceof Error) {
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
        message.info("Please select time logs to mark as completed.");
        return;
      }

      const updates: BatchUpdateItem[] = selectedRowKeys.map((key) => ({
        id: Number(key),
        actualTimelogStatus: "COMPLETED" as TimelogStatusType,
      }));

      setBatchSaving(true);
      try {
        await batchUpdateTimeLogsApi(updates);
        message.success(`${updates.length} time log(s) marked as completed!`);
        onRefreshData();
      } catch (err) {
        console.error("Error marking time logs as completed:", err);
        if (err instanceof Error) {
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
