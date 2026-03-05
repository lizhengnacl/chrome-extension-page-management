import { LocalStorage } from './local-storage.js';

export const ThumbnailManager = {
  THUMBNAIL_EXPIRY_DAYS: 7,

  generateThumbnailUrl(url) {
    try {
      const encodedUrl = encodeURIComponent(url);
      return `https://api.microlink.io/?url=${encodedUrl}&screenshot=true&meta=false`;
    } catch (error) {
      console.error('生成缩略图 URL 失败:', error);
      return null;
    }
  },

  getFaviconUrl(url) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (error) {
      console.error('获取 favicon URL 失败:', error);
      return null;
    }
  },

  isValidThumbnailUrl(url) {
    if (!url) return false;
    if (typeof url !== 'string') return false;
    if (url.trim() === '') return false;
    return true;
  },

  shouldUpdateThumbnail(thumbnail) {
    if (!thumbnail) return true;
    
    if (!thumbnail.updatedAt) return true;
    
    const updatedAt = new Date(thumbnail.updatedAt);
    const now = new Date();
    const daysDiff = (now - updatedAt) / (1000 * 60 * 60 * 24);
    
    return daysDiff > this.THUMBNAIL_EXPIRY_DAYS;
  },

  async getThumbnailForPage(page) {
    if (!page || !page.id || !page.url) {
      return null;
    }

    const existingThumbnail = await LocalStorage.getThumbnail(page.id);

    if (!this.shouldUpdateThumbnail(existingThumbnail)) {
      return existingThumbnail;
    }

    const newThumbnail = await this.generateThumbnail(page);
    
    if (newThumbnail) {
      await LocalStorage.saveThumbnail(newThumbnail);
      return newThumbnail;
    }

    return existingThumbnail;
  },

  async generateThumbnail(page) {
    const now = new Date().toISOString();
    
    const faviconUrl = this.getFaviconUrl(page.url);
    let thumbnailUrl = null;
    
    try {
      const encodedUrl = encodeURIComponent(page.url);
      const apiUrl = `https://api.microlink.io/?url=${encodedUrl}&meta=true&screenshot=false`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        if (data.data.image && data.data.image.url) {
          thumbnailUrl = data.data.image.url;
        } else if (data.data.og && data.data.og.image) {
          thumbnailUrl = data.data.og.image;
        }
      }
    } catch (error) {
      console.error('获取网页元数据失败:', error);
    }
    
    return {
      pageId: page.id,
      thumbnailUrl: thumbnailUrl,
      faviconUrl: faviconUrl,
      createdAt: now,
      updatedAt: now
    };
  },

  async refreshThumbnail(pageId) {
    const thumbnails = await LocalStorage.getThumbnails();
    const existingThumbnail = thumbnails.find(t => t.pageId === pageId);
    
    if (!existingThumbnail) {
      return null;
    }

    const now = new Date().toISOString();
    existingThumbnail.updatedAt = now;
    
    await LocalStorage.saveThumbnail(existingThumbnail);
    return existingThumbnail;
  },

  async getThumbnailsForPages(pages) {
    const results = [];
    
    for (const page of pages) {
      const thumbnail = await this.getThumbnailForPage(page);
      results.push({
        pageId: page.id,
        thumbnail: thumbnail
      });
    }
    
    return results;
  }
};
