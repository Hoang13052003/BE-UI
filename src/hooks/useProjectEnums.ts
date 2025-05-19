import { useState, useEffect } from 'react';

export enum ProjectTypeEnum {
  FIXED_PRICE = 'FIXED_PRICE',
  LABOR = 'LABOR'
}

export enum ProjectStatusEnum {
  NEW = 'NEW',
  PENDING = 'PENDING',
  PROGRESS = 'PROGRESS',
  CLOSED = 'CLOSED'
}

export const useProjectEnums = () => {
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading for consistent UI behavior (optional)
    setLoading(true);
    
    try {
      // Convert enum objects to arrays of strings
      const types = Object.values(ProjectTypeEnum);
      const statuses = Object.values(ProjectStatusEnum);
      
      setTypeOptions(types);
      setStatusOptions(statuses);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách loại dự án hoặc trạng thái.");
    } finally {
      setLoading(false);
    }
  }, []); // Still run once on component mount

  return { typeOptions, statusOptions, loading, error };
};