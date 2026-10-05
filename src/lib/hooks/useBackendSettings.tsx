import { useEffect, useState } from 'react';
import { settingsApi } from '../api';

export function useBackendSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    settingsApi.getAll()
      .then(res => setSettings(res.settings))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading, error };
}