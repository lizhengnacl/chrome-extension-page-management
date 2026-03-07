import { useState, useEffect, useCallback } from 'react';
import { getStorageData, setStorageData } from '../utils/storage';
import type { StorageData } from '../types';

interface UseStorageReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  setData: (data: T) => Promise<void>;
  updateData: (updater: (prev: T) => T) => Promise<void>;
}

export function useStorage<T extends StorageData>(
  key: string,
  defaultValue: T
): UseStorageReturn<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const storedData = await getStorageData();
      if (storedData) {
        setDataState(storedData as T);
      } else {
        setDataState(defaultValue);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading storage data:', err);
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue]);

  const setData = useCallback(async (newData: T) => {
    try {
      setError(null);
      await setStorageData(newData);
      setDataState(newData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save data';
      setError(errorMessage);
      console.error('Error saving storage data:', err);
      throw err;
    }
  }, []);

  const updateData = useCallback(async (updater: (prev: T) => T) => {
    try {
      setError(null);
      const currentData = data || defaultValue;
      const newData = updater(currentData);
      await setData(newData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update data';
      setError(errorMessage);
      console.error('Error updating storage data:', err);
      throw err;
    }
  }, [data, defaultValue, setData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    setData,
    updateData,
  };
}
