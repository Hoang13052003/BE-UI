// src/hooks/useAuditLogFilters.ts
import { useState, useCallback, useEffect } from 'react';
import { AuditLogFilter } from '../types/auditLog.types';
import { auditLogApi } from '../api/auditLogApi';
import { AuditLogRealtimeDto, PageResponse } from '../api/auditLogApi';

interface UseAuditLogFiltersReturn {
  filter: AuditLogFilter;
  setFilter: (filter: AuditLogFilter) => void;
  clearFilters: () => void;
  filteredData: PageResponse<AuditLogRealtimeDto> | null;
  isLoading: boolean;
  error: string | null;
  fetchFilteredLogs: (page?: number, size?: number) => Promise<void>;
  hasActiveFilters: boolean;
  clearError: () => void;
}

const defaultFilter: AuditLogFilter = {
  category: undefined,
  severity: undefined,
  startTime: undefined,
  endTime: undefined,
  username: undefined,
  actionType: undefined,
  success: undefined
};

export const useAuditLogFilters = (): UseAuditLogFiltersReturn => {
  const [filter, setFilter] = useState<AuditLogFilter>(defaultFilter);
  const [filteredData, setFilteredData] = useState<PageResponse<AuditLogRealtimeDto> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearFilters = useCallback(() => {
    setFilter(defaultFilter);
    setFilteredData(null);
    setError(null);
  }, []);

  const hasActiveFilters = Object.values(filter).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchFilteredLogs = useCallback(async (page: number = 0, size: number = 50) => {
    if (!hasActiveFilters) {
      setFilteredData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await auditLogApi.getFilteredAuditLogs(filter, page, size);
      setFilteredData(response);
    } catch (err) {
      console.error('Error fetching filtered audit logs:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filtered audit logs';
      setError(errorMessage);
      setFilteredData(null);
    } finally {
      setIsLoading(false);
    }
  }, [filter, hasActiveFilters]);
  // Auto-fetch when filter changes (debounced)
  useEffect(() => {
    if (!hasActiveFilters) {
      setFilteredData(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchFilteredLogs(0, 50);
    }, 150); // Reduced from 300ms to 150ms for better responsiveness

    return () => clearTimeout(timeoutId);
  }, [fetchFilteredLogs, hasActiveFilters]);
  return {
    filter,
    setFilter,
    clearFilters,
    filteredData,
    isLoading,
    error,
    fetchFilteredLogs,
    hasActiveFilters,
    clearError
  };
};
