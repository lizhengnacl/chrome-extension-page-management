import { useCallback } from 'react';
import { useStorage } from './useStorage';
import { DEFAULT_DATA, STORAGE_KEY } from '../utils/constants';
import { generateId, getTimestamp } from '../utils/utils';
import type { Group, StorageData } from '../types';

interface UseGroupsReturn {
  groups: Group[];
  loading: boolean;
  error: string | null;
  addGroup: (name: string) => Promise<Group>;
  updateGroup: (id: string, name: string) => Promise<Group>;
  deleteGroup: (id: string) => Promise<void>;
  reorderGroups: (newOrder: string[]) => Promise<void>;
  openAllPagesInGroup: (groupId: string) => Promise<void>;
}

export function useGroups(): UseGroupsReturn {
  const { data, loading, error, updateData } = useStorage<StorageData>(STORAGE_KEY, DEFAULT_DATA as StorageData);

  const groups = data?.groups || [];

  const addGroup = useCallback(async (name: string): Promise<Group> => {
    try {
      const newGroup: Group = {
        id: generateId('group'),
        name,
        order: groups.length,
        createdAt: getTimestamp(),
      };

      await updateData((prev) => ({
        ...prev,
        groups: [...prev.groups, newGroup],
      }));

      return newGroup;
    } catch (err) {
      console.error('Failed to add group:', err);
      throw err;
    }
  }, [updateData, groups.length]);

  const updateGroup = useCallback(async (id: string, name: string): Promise<Group> => {
    try {
      let updatedGroup: Group | undefined;

      await updateData((prev) => {
        const groupIndex = prev.groups.findIndex((g) => g.id === id);
        if (groupIndex === -1) {
          throw new Error('Group not found');
        }

        updatedGroup = {
          ...prev.groups[groupIndex],
          name,
        };

        const newGroups = [...prev.groups];
        newGroups[groupIndex] = updatedGroup;

        return {
          ...prev,
          groups: newGroups,
        };
      });

      if (!updatedGroup) {
        throw new Error('Group not found');
      }
      return updatedGroup;
    } catch (err) {
      console.error('Failed to update group:', err);
      throw err;
    }
  }, [updateData]);

  const deleteGroup = useCallback(async (id: string): Promise<void> => {
    try {
      await updateData((prev) => ({
        ...prev,
        groups: prev.groups.filter((g) => g.id !== id),
        pages: prev.pages.map((page) => {
          if (page.groupId === id) {
            return { ...page, groupId: null };
          }
          return page;
        }),
      }));
    } catch (err) {
      console.error('Failed to delete group:', err);
      throw err;
    }
  }, [updateData]);

  const reorderGroups = useCallback(async (newOrder: string[]): Promise<void> => {
    try {
      await updateData((prev) => {
        const reorderedGroups = newOrder
          .map((id) => prev.groups.find((g) => g.id === id))
          .filter((g): g is Group => g !== undefined);

        return {
          ...prev,
          groups: reorderedGroups,
        };
      });
    } catch (err) {
      console.error('Failed to reorder groups:', err);
      throw err;
    }
  }, [updateData]);

  const openAllPagesInGroup = useCallback(async (groupId: string): Promise<void> => {
    try {
      const pagesInGroup = data?.pages.filter((p) => p.groupId === groupId) || [];
      
      if (pagesInGroup.length === 0) {
        return;
      }

      for (let i = 0; i < pagesInGroup.length; i++) {
        const page = pagesInGroup[i];
        if (i === 0) {
          chrome.tabs.update({ url: page.url });
        } else {
          chrome.tabs.create({ url: page.url, active: false });
        }
      }
    } catch (err) {
      console.error('Failed to open all pages in group:', err);
      throw err;
    }
  }, [data]);

  return {
    groups,
    loading,
    error,
    addGroup,
    updateGroup,
    deleteGroup,
    reorderGroups,
    openAllPagesInGroup,
  };
}
