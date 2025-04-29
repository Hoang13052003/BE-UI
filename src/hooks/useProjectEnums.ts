import { useState, useEffect } from 'react';
import { getProjectTypesApi, getProjectStatusesApi } from '../api/projectApi';
import { message } from 'antd';

export const useProjectEnums = () => {
  const [typeOptions, setTypeOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state update on unmounted component
    setLoading(true);
    setError(null);
    Promise.all([
      getProjectTypesApi(),
      getProjectStatusesApi(),
    ])
      .then(([types, statuses]) => {
        if (isMounted) {
          setTypeOptions(types);
          setStatusOptions(statuses);
        }
      })
      .catch(() => {
        if (isMounted) {
          const errMsg = "Không tải được danh sách loại dự án hoặc trạng thái.";
          message.error(errMsg);
          setError(errMsg);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

      return () => {
        isMounted = false; // Cleanup function to set flag false when component unmounts
      };
  }, []); // Fetch only once

  return { typeOptions, statusOptions, loading, error };
};