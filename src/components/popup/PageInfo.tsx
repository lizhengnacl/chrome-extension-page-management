interface PageInfoProps {
  url: string;
  title: string;
  favicon: string;
}

const DEFAULT_FAVICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0UzRTRFNSIvPgo8cGF0aCBkPSJNMCA4QzAgNi4zNDMxNSAxLjM0MzE1IDUgMyA1SDI5QzMwLjY1NjkgNSAzMiA2LjM0MzE1IDMyIDhWMjRDMzIgMjUuNjU2OSAzMC42NTY5IDI3IDI5IDI3SDNIMUMxLjM0MzE1IDI3IDAgMjUuNjU2OSAwIDI0VjhaIiBmaWxsPSIjNUI3Rjk3Ii8+CjxwYXRoIGQ9Ik03IDExQzcgOS4zNDMxNSA4LjM0MzE1IDggMTAgOEgyMkMyMy42NTY5IDggMjUgOS4zNDMxNSAyNSAxMVYxOUMyNSAyMC42NTY9IDIzLjY1NjkgMjIgMjIgMjJIMTBDOC4zNDMxNSAyMiA3IDIwLjY1NjkgNyAxOVYxMVoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+';

export function PageInfo({ url, title, favicon }: PageInfoProps) {
  return (
    <div className="flex gap-4 p-4 bg-background-tertiary/30 rounded-xl border border-border/30 shadow-lg">
      <div className="flex-shrink-0">
        <img
          src={favicon || DEFAULT_FAVICON}
          alt="favicon"
          className="w-12 h-12 rounded-xl shadow-md"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_FAVICON;
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text-primary mb-1 truncate">{title || '无标题'}</div>
        <div className="text-sm text-text-muted truncate">{url}</div>
      </div>
    </div>
  );
}
