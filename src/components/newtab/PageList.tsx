import { PageItem } from './PageItem';
import type { Page, Tag } from '../../types';

interface PageListProps {
  pages: Page[];
  tags: Tag[];
  onToggleFavorite: (pageId: string) => Promise<void>;
  onEdit: (pageId: string) => void;
  onDelete: (pageId: string) => Promise<void>;
  emptyMessage?: string;
}

export function PageList({ pages, tags, onToggleFavorite, onEdit, onDelete, emptyMessage = '暂无页面' }: PageListProps) {
  if (pages.length === 0) {
    return <p className="text-gray-500 text-sm p-4">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {pages.map((page) => (
        <PageItem
          key={page.id}
          page={page}
          tags={tags}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
