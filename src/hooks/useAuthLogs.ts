// src/hooks/useAuthLogs.ts

import { useState, useEffect, useCallback } from 'react';
import auditLogService from '../services/auditLogService';
import { AuditLog, AuthStats } from '../types/auditLog.types';

export const useAuthLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuthStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Gọi song song 2 API chính
      const [logsResponse, statsResponse] = await Promise.all([
        auditLogService.getRecentAuthLogs(50),
        auditLogService.getBasicAuthStats(),
      ]);
      setLogs(logsResponse.data);
      setStats(statsResponse.data);
    } catch (err: any) {
      console.error("Failed to fetch auth logs data:", err);
      setError(err.message || "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return { logs, stats, loading, error, refetch: fetchInitialData };
};