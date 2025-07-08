import { useState, useCallback } from "react";
import { getMilestonesByProjectFixedPriceIdApi } from "../../../api/milestoneApi";
import { Milestone } from "../../../types/milestone";

export function useMilestoneList(projectId: string, pageSizeDefault = 10) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeDefault);
  const [totalItems, setTotalItems] = useState(0);

  const fetchMilestones = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      setError("Invalid Project ID provided.");
      setMilestones([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { milestones: milestoneData, totalItems } = await getMilestonesByProjectFixedPriceIdApi(projectId, currentPage, pageSize);
      setMilestones(Array.isArray(milestoneData) ? milestoneData : []);
      setTotalItems(totalItems);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load milestone details.");
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, currentPage, pageSize]);

  return {
    milestones,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    setCurrentPage,
    setPageSize,
    fetchMilestones,
    setMilestones,
    setError,
  };
} 