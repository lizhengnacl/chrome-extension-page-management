import { useCallback } from 'react';
import { useStorage } from './useStorage';
import { DEFAULT_DATA, STORAGE_KEY } from '../utils/constants';
import { generateId, getTimestamp } from '../utils/utils';
import type { Page, StorageData } from '../types';

interface UsePagesReturn {
  pages: Page[];
  loading: boolean;
  error: string | null;
  addPage: (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Page>;
  updatePage: (id: string, updates: Partial<Page>) => Promise<Page>;
  deletePage: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  reorderPages: (groupId: string | null, newOrder: string[]) => Promise<void>;
}

export function usePages(): UsePagesReturn {
  const { data, loading, error, updateData } = useStorage<StorageData>(STORAGE_KEY, DEFAULT_DATA as StorageData);

  const pages = data?.pages || [];

  const addPage = useCallback(async (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>): Promise<Page> => {
    try {
      const newPage: Page = {
        ...page,
        id: generateId('page'),
        createdAt: getTimestamp(),
        updatedAt: getTimestamp(),
      };

      await updateData((prev) => ({
        ...prev,
        pages: [...prev.pages, newPage],
      }));

      return newPage;
    } catch (err) {
      console.error('Failed to add page:', err);
      throw err;
    }
  }, [updateData]);

  const updatePage = useCallback(async (id: string, updates: Partial<Page>): Promise<Page> => {
    try {
      let updatedPage: Page | undefined;

      await updateData((prev) => {
        const pageIndex = prev.pages.findIndex((p) => p.id === id);
        if (pageIndex === -1) {
          throw new Error('Page not found');
        }

        updatedPage = {
          ...prev.pages[pageIndex],
          ...updates,
          updatedAt: getTimestamp(),
        };

        const newPages = [...prev.pages];
        newPages[pageIndex] = updatedPage;

        return {
          ...prev,
          pages: newPages,
        };
      });

      if (!updatedPage) {
        throw new Error('Page not found');
      }
      return updatedPage;
    } catch (err) {
      console.error('Failed to update page:', err);
      throw err;
    }
  }, [updateData]);

  const deletePage = useCallback(async (id: string): Promise<void> => {
    try {
      await updateData((prev) => ({
        ...prev,
        pages: prev.pages.filter((p) => p.id !== id),
      }));
    } catch (err) {
      console.error('Failed to delete page:', err);
      throw err;
    }
  }, [updateData]);

  const toggleFavorite = useCallback(async (id: string): Promise<void> => {
    try {
      await updateData((prev) => {
        const pageIndex = prev.pages.findIndex((p) => p.id === id);
        if (pageIndex === -1) {
          return prev;
        }

        const newPages = [...prev.pages];
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          isFavorite: !newPages[pageIndex].isFavorite,
          updatedAt: getTimestamp(),
        };

        return {
          ...prev,
          pages: newPages,
        };
      });
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      throw err;
    }
  }, [updateData]);

  const reorderPages = useCallback(async (groupId: string | null, newOrder: string[]): Promise<void> => {
    try {
      await updateData((prev) => {
        const pagesInGroup = prev.pages.filter((p) => p.groupId === groupId);
        const otherPages = prev.pages.filter((p) => p.groupId !== groupId);

        const reorderedPages = newOrder
          .map((id) => pagesInGroup.find((p) => p.id === id))
          .filter((p): p is Page => p !== undefined);

        return {
          ...prev,
          pages: [...otherPages, ...reorderedPages],
        };
      });
    } catch (err) {
      console.error('Failed to reorder pages:', err);
      throw err;
    }
  }, [updateData]);

  return {
    pages,
    loading,
    error,
    addPage,
    updatePage,
    deletePage,
    toggleFavorite,
    reorderPages,
  };
}
