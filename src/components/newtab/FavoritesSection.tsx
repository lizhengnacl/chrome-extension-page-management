import { PageList } from './PageList';
import type { Page, Tag } from '../../types';

interface FavoritesSectionProps {
  pages: Page[];
  tags: Tag[];
  onToggleFavorite: (pageId: string) => Promise<void>;
  onEdit: (pageId: string) => void;
  onDelete: (pageId: string) => Promise<void>;
}

export function FavoritesSection({ pages, tags, onToggleFavorite, onEdit, onDelete }: FavoritesSectionProps) {
  if (pages.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">⭐ 常用</h2>
      </div>
      <PageList
        pages={pages}
        tags={tags}
        onToggleFavorite={onToggleFavorite}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyMessage="暂无常用页面"
      />
    </div>
  );
}
