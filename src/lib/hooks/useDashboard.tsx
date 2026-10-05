import { useEffect, useState } from 'react';
import { dashboardApi } from '../api';
import { useBackendAuth } from './useBackendAuth';

export function useDashboard() {
  const { role } = useBackendAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role || role === 'user') return;
    const fetch = role === 'admin'
      ? dashboardApi.adminStats
      : role === 'teacher'
        ? dashboardApi.teacherDashboard
        : dashboardApi.studentDashboard;
    fetch()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [role]);

  return { data, loading, error };
}