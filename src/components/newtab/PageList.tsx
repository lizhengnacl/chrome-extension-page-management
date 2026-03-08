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
    return <p className="text-text-muted text-sm p-4 text-center">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {pages.map((page, index) => (
        <div key={page.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-fade-in">
          <PageItem
            page={page}
            tags={tags}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
