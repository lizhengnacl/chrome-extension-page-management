export const Search = {
  searchPages(pages, query) {
    if (!query || !query.trim()) {
      return pages;
    }
    
    const lowerQuery = query.toLowerCase().trim();
    
    const scoredPages = pages.map(page => {
      const score = this.calculateMatchScore(page, lowerQuery);
      return { ...page, score };
    }).filter(page => page.score > 0);
    
    scoredPages.sort((a, b) => b.score - a.score);
    
    return scoredPages;
  },
  
  calculateMatchScore(page, query) {
    let score = 0;
    
    if (page.title && page.title.toLowerCase().includes(query)) {
      score += 10;
      if (page.title.toLowerCase().startsWith(query)) {
        score += 5;
      }
    }
    
    if (page.url && page.url.toLowerCase().includes(query)) {
      score += 5;
    }
    
    if (page.tags && page.tags.length > 0) {
      page.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query)) {
          score += 8;
        }
      });
    }
    
    if (page.notes && page.notes.toLowerCase().includes(query)) {
      score += 3;
    }
    
    return score;
  }
};
