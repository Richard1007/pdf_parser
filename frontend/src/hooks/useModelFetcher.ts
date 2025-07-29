import { useState, useEffect } from 'react';
import { getModels, Model, ApiError } from '../utils/api';

export interface UseModelFetcherReturn {
  models: Model[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useModelFetcher = (): UseModelFetcherReturn => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await getModels();
      setModels(response.models);
    } catch (err) {
      console.error('Error fetching models:', err);
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load available models';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return {
    models,
    loading,
    error,
    refetch: fetchModels,
  };
}; 