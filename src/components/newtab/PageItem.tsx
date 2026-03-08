import { useState, memo } from 'react';
import { Button } from '../common';
import { Tag } from '../common';
import type { Page, Tag as TagType } from '../../types';

interface PageItemProps {
  page: Page;
  tags: TagType[];
  onToggleFavorite: (pageId: string) => Promise<void>;
  onEdit: (pageId: string) => void;
  onDelete: (pageId: string) => Promise<void>;
}

const DEFAULT_FAVICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0UzRTRFNSIvPgo8cGF0aCBkPSJNMCA4QzAgNi4zNDMxNSAxLjM0MzE1IDUgMyA1SDI5QzMwLjY1NjkgNSAzMiA2LjM0MzE1IDMyIDhWMjRDMzIgMjUuNjU2OSAzMC42NTY5IDI3IDI5IDI3SDNIMUMxLjM0MzE1IDI3IDAgMjUuNjU2OSAwIDI0VjhaIiBmaWxsPSIjNUI3Rjk3Ii8+CjxwYXRoIGQ9Ik03IDExQzcgOS4zNDMxNSA4LjM0MzE1IDggMTAgOEgyMkMyMy42NTY5IDggMjUgOS4zNDMxNSAyNSAxMVYxOUMyNSAyMC42NTY9IDIzLjY1NjkgMjIgMjIgMjJIMTBDOC4zNDMxNSAyMiA3IDIwLjY1NjkgNyAxOVYxMVoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+';

function PageItemComponent({ page, tags, onToggleFavorite, onEdit, onDelete }: PageItemProps) {
  const [faviconError, setFaviconError] = useState(false);
  const pageTags = tags.filter((t) => page.tags.includes(t.id));

  return (
    <div className="group flex items-center gap-4 p-4 bg-background-tertiary/30 rounded-xl border border-border/30 hover:border-primary-500/30 hover:bg-background-tertiary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative flex-shrink-0">
        <img
          src={faviconError ? DEFAULT_FAVICON : page.favicon || DEFAULT_FAVICON}
          alt=""
          className="w-10 h-10 rounded-xl flex-shrink-0 shadow-md"
          onError={() => setFaviconError(true)}
        />
        {page.isFavorite && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-3 h-3 text-yellow-900"
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
        )}
      </div>
      <div className="flex-1 min-w-0">
        <a
          href={page.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-text-primary mb-1 truncate block hover:text-primary-400 transition-colors"
          style={{ textDecoration: 'none' }}
        >
          {page.title}
        </a>
        <div className="text-sm text-text-muted truncate mb-2">{page.url}</div>
        {pageTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {pageTags.map((tag) => (
              <Tag key={tag.id} color={tag.color} size="sm">
                {tag.name}
              </Tag>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          onClick={() => onToggleFavorite(page.id)}
          className={`text-text-muted hover:text-yellow-400 hover:bg-yellow-400/10 ${page.isFavorite ? 'text-yellow-400 opacity-100' : ''}`}
          title={page.isFavorite ? '取消常用' : '添加到常用'}
        >
          {page.isFavorite ? (
            <svg
              className="w-5 h-5"
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
          ) : (
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          onClick={() => onEdit(page.id)}
          className="text-text-muted hover:text-primary-400 hover:bg-primary-400/10"
          title="编辑"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          onClick={() => onDelete(page.id)}
          className="text-text-muted hover:text-danger hover:bg-danger/10"
          title="删除"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

export const PageItem = memo(PageItemComponent);
