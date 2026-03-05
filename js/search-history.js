export const SearchHistory = {
  validateQuery(query) {
    if (!query || typeof query !== 'string') {
      return false;
    }
    return query.trim().length > 0;
  },

  deduplicateHistory(history) {
    const validHistory = Array.isArray(history) ? history : [];
    const seen = new Map();
    
    validHistory.forEach(item => {
      if (item && item.query) {
        const key = item.query.toLowerCase();
        if (!seen.has(key) || new Date(item.searchedAt) > new Date(seen.get(key).searchedAt)) {
          seen.set(key, item);
        }
      }
    });
    
    return Array.from(seen.values()).sort((a, b) => 
      new Date(b.searchedAt) - new Date(a.searchedAt)
    );
  },

  limitHistoryLength(history, limit = 50) {
    const validHistory = Array.isArray(history) ? history : [];
    const validLimit = Math.max(1, Math.min(limit, 100));
    return validHistory.slice(0, validLimit);
  },

  formatHistoryItem(item) {
    if (!item || !item.query) {
      return null;
    }
    
    const date = item.searchedAt ? new Date(item.searchedAt) : new Date();
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let formattedDate = '';
    if (diffDays === 0) {
      formattedDate = '今天';
    } else if (diffDays === 1) {
      formattedDate = '昨天';
    } else if (diffDays < 7) {
      formattedDate = `${diffDays} 天前`;
    } else {
      formattedDate = date.toLocaleDateString('zh-CN');
    }
    
    return {
      query: item.query,
      displayQuery: item.query,
      searchedAt: item.searchedAt,
      formattedDate: formattedDate
    };
  },

  filterHistory(history, query) {
    const validHistory = Array.isArray(history) ? history : [];
    
    if (!query || !query.trim()) {
      return validHistory;
    }
    
    const lowerQuery = query.toLowerCase().trim();
    
    return validHistory.filter(item => {
      if (!item || !item.query) return false;
      return item.query.toLowerCase().includes(lowerQuery);
    });
  },

  clearHistory() {
    return [];
  },

  getSuggestions(history, pages, query, limit = 10) {
    const validHistory = Array.isArray(history) ? history : [];
    const validPages = Array.isArray(pages) ? pages : [];
    const validLimit = Math.max(1, Math.min(limit, 20));
    
    const suggestions = [];
    const seen = new Set();
    
    if (query && query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      
      const filteredHistory = this.filterHistory(validHistory, query);
      filteredHistory.slice(0, validLimit).forEach(item => {
        if (!seen.has(item.query.toLowerCase())) {
          seen.add(item.query.toLowerCase());
          suggestions.push({
            type: 'history',
            query: item.query,
            displayText: item.query
          });
        }
      });
      
      validPages.forEach(page => {
        if (page.title && page.title.toLowerCase().includes(lowerQuery)) {
          if (!seen.has(`page-${page.id}`)) {
            seen.add(`page-${page.id}`);
            suggestions.push({
              type: 'page',
              pageId: page.id,
              query: page.title,
              displayText: page.title,
              url: page.url
            });
          }
        }
      });
    } else {
      validHistory.slice(0, validLimit).forEach(item => {
        if (!seen.has(item.query.toLowerCase())) {
          seen.add(item.query.toLowerCase());
          suggestions.push({
            type: 'history',
            query: item.query,
            displayText: item.query
          });
        }
      });
    }
    
    return suggestions.slice(0, validLimit);
  }
};
