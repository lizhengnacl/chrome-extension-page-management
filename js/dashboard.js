export const Dashboard = {
  calculateStatistics(pages, folders) {
    const validPages = Array.isArray(pages) ? pages : [];
    const validFolders = Array.isArray(folders) ? folders : [];

    const totalPages = validPages.length;
    const totalFolders = validFolders.length;
    const totalVisits = validPages.reduce((sum, page) => sum + (page.visitCount || 0), 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pagesAddedToday = validPages.filter(page => {
      if (!page.createdAt) return false;
      const createdDate = new Date(page.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    }).length;

    return {
      totalPages,
      totalFolders,
      totalVisits,
      pagesAddedToday
    };
  },

  getTopPages(pages, limit = 10) {
    const validPages = Array.isArray(pages) ? pages : [];
    const validLimit = Math.max(1, Math.min(limit, 100));

    return [...validPages]
      .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
      .slice(0, validLimit);
  },

  getRecentPages(pages, limit = 10) {
    const validPages = Array.isArray(pages) ? pages : [];
    const validLimit = Math.max(1, Math.min(limit, 100));

    return [...validPages]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, validLimit);
  },

  getFolderStats(pages, folders) {
    const validPages = Array.isArray(pages) ? pages : [];
    const validFolders = Array.isArray(folders) ? folders : [];

    const folderPageCount = {};
    
    validPages.forEach(page => {
      const folderId = page.folderId || null;
      if (!folderPageCount[folderId]) {
        folderPageCount[folderId] = 0;
      }
      folderPageCount[folderId]++;
    });

    const stats = validFolders.map(folder => ({
      id: folder.id,
      name: folder.name,
      count: folderPageCount[folder.id] || 0
    }));

    if (folderPageCount[null] && folderPageCount[null] > 0) {
      stats.push({
        id: null,
        name: '未分组',
        count: folderPageCount[null]
      });
    }

    return stats.sort((a, b) => b.count - a.count);
  },

  formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays} 天前`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} 周前`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} 个月前`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} 年前`;
      }
    } catch (error) {
      return '';
    }
  },

  getVisitTrend(pages, days = 7) {
    const validPages = Array.isArray(pages) ? pages : [];
    const trend = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const visitsOnDay = validPages.filter(page => {
        if (!page.lastVisitedAt) return false;
        const visitDate = new Date(page.lastVisitedAt);
        return visitDate >= date && visitDate < nextDate;
      }).length;

      trend.push({
        date: date.toISOString(),
        label: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        visits: visitsOnDay
      });
    }

    return trend;
  },

  getTagStats(pages) {
    const validPages = Array.isArray(pages) ? pages : [];
    const tagCount = {};

    validPages.forEach(page => {
      if (Array.isArray(page.tags)) {
        page.tags.forEach(tag => {
          if (tag) {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }
};
