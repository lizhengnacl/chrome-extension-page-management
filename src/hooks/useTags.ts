import { useCallback } from 'react';
import { useStorage } from './useStorage';
import { DEFAULT_DATA, STORAGE_KEY } from '../utils/constants';
import { generateId } from '../utils/utils';
import { generateColorFromTagName } from '../utils/colors';
import type { Tag, StorageData } from '../types';

interface UseTagsReturn {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  addTag: (name: string, color?: string) => Promise<Tag>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
}

export function useTags(): UseTagsReturn {
  const { data, loading, error, updateData } = useStorage<StorageData>(STORAGE_KEY, DEFAULT_DATA as StorageData);

  const tags = data?.tags || [];

  const addTag = useCallback(async (name: string, color?: string): Promise<Tag> => {
    try {
      const tagColor = color || generateColorFromTagName(name);
      
      const newTag: Tag = {
        id: generateId('tag'),
        name,
        color: tagColor,
      };

      await updateData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));

      return newTag;
    } catch (err) {
      console.error('Failed to add tag:', err);
      throw err;
    }
  }, [updateData]);

  const updateTag = useCallback(async (id: string, updates: Partial<Tag>): Promise<Tag> => {
    try {
      let updatedTag: Tag | undefined;

      await updateData((prev) => {
        const tagIndex = prev.tags.findIndex((t) => t.id === id);
        if (tagIndex === -1) {
          throw new Error('Tag not found');
        }

        updatedTag = {
          ...prev.tags[tagIndex],
          ...updates,
        };

        const newTags = [...prev.tags];
        newTags[tagIndex] = updatedTag;

        return {
          ...prev,
          tags: newTags,
        };
      });

      if (!updatedTag) {
        throw new Error('Tag not found');
      }
      return updatedTag;
    } catch (err) {
      console.error('Failed to update tag:', err);
      throw err;
    }
  }, [updateData]);

  const deleteTag = useCallback(async (id: string): Promise<void> => {
    try {
      await updateData((prev) => ({
        ...prev,
        tags: prev.tags.filter((t) => t.id !== id),
        pages: prev.pages.map((page) => ({
          ...page,
          tags: page.tags.filter((tagId) => tagId !== id),
        })),
      }));
    } catch (err) {
      console.error('Failed to delete tag:', err);
      throw err;
    }
  }, [updateData]);

  return {
    tags,
    loading,
    error,
    addTag,
    updateTag,
    deleteTag,
  };
}
