interface PageInfoProps {
  url: string;
  title: string;
  favicon: string;
}

const DEFAULT_FAVICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iNCIgeT0iNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0UzRTRFNSIvPgo8cGF0aCBkPSJNMCA4QzAgNi4zNDMxNSAxLjM0MzE1IDUgMyA1SDI5QzMwLjY1NjkgNSAzMiA2LjM0MzE1IDMyIDhWMjRDMzIgMjUuNjU2OSAzMC42NTY5IDI3IDI5IDI3SDNIMUMxLjM0MzE1IDI3IDAgMjUuNjU2OSAwIDI0VjhaIiBmaWxsPSIjNUI3Rjk3Ii8+CjxwYXRoIGQ9Ik03IDExQzcgOS4zNDMxNSA4LjM0MzE1IDggMTAgOEgyMkMyMy42NTY5IDggMjUgOS4zNDMxNSAyNSAxMVYxOUMyNSAyMC42NTY5IDIzLjY1NjkgMjIgMjIgMjJIMTBDOC4zNDMxNSAyMiA3IDIwLjY1NjkgNyAxOVYxMVoiIGZpbGw9IiNGRkZGRkYiLz4KPC9zdmc+';

export function PageInfo({ url, title, favicon }: PageInfoProps) {
  return (
    <div className="flex gap-3 p-4 bg-white rounded-lg mb-5 shadow-sm">
      <div className="flex-shrink-0">
        <img
          src={favicon || DEFAULT_FAVICON}
          alt="favicon"
          className="w-8 h-8 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_FAVICON;
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm mb-1 truncate">{title || '无标题'}</div>
        <div className="text-xs text-gray-500 truncate">{url}</div>
      </div>
    </div>
  );
}
