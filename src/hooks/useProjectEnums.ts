import { useState, useEffect } from "react";

export enum ProjectTypeEnum {
  FIXED_PRICE = "FIXED_PRICE",
  LABOR = "LABOR",
}

export enum ProjectStatusEnum {
  NEW = "NEW",
  PENDING = "PENDING",
  PROGRESS = "PROGRESS",
  CLOSED = "CLOSED",
}

export const useProjectEnums = () => {
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    try {
      const types = Object.values(ProjectTypeEnum);
      const statuses = Object.values(ProjectStatusEnum);

      setTypeOptions(types);
      setStatusOptions(statuses);
      setError(null);
    } catch (err) {
      setError("Unable to load project types or statuses.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { typeOptions, statusOptions, loading, error };
};
