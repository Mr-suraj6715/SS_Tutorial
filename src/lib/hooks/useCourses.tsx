import { useEffect, useState } from 'react';
import { coursesApi } from '../api';

export function useCourses(filters?: { board?: string; class?: string }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    coursesApi.list(filters)
      .then(res => setCourses(res.courses ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters?.board, filters?.class]);

  return { courses, loading, error };
}