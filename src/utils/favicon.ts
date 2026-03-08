export function getDefaultFavicon(): string {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzRGNDRFNSIvPgo8cGF0aCBkPSJNOCAxMEgyNFYyNEg4VjEwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iMTIgMTRIMjBWMjBIMTJWMTRaIiBmaWxsPSIjNEY0NEU1Ii8+Cjwvc3ZnPg=='
}

export function getFaviconUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}&sz=64`
  } catch {
    return getDefaultFavicon()
  }
}
