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
    <div className="bg-background-secondary/80 backdrop-blur-xl rounded-2xl p-6 border border-border/50 shadow-xl animate-slide-in-right">
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/25">
            <svg
              className="w-5 h-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary">常用页面</h2>
        </div>
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
