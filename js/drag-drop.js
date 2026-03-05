export const DragDrop = {
  validateDragData(data) {
    if (!data || !data.pageId) {
      return false;
    }
    return true;
  },

  calculateNewPosition(pages, targetIndex, excludePageId) {
    if (!pages || pages.length === 0) {
      return 1;
    }

    if (targetIndex <= 0) {
      const firstPage = pages[0];
      return (firstPage.order || 1) - 1;
    }

    if (targetIndex >= pages.length - 1) {
      const lastPage = pages[pages.length - 1];
      return (lastPage.order || pages.length) + 1;
    }

    const prevPage = pages[targetIndex - 1];
    const nextPage = pages[targetIndex];
    const prevOrder = prevPage.order || targetIndex;
    const nextOrder = nextPage.order || targetIndex + 1;
    return (prevOrder + nextOrder) / 2;
  },

  reorderPages(pages, draggedPageId, targetIndex, targetFolderId) {
    const result = [...pages];
    const draggedPageIndex = result.findIndex(p => p.id === draggedPageId);
    
    if (draggedPageIndex === -1) {
      return pages;
    }

    const [draggedPage] = result.splice(draggedPageIndex, 1)[0];
    
    if (targetFolderId) {
      draggedPage.folderId = targetFolderId;
    }

    const newOrder = this.calculateNewPosition(result, targetIndex);
    draggedPage.order = newOrder;
    
    if (targetIndex > draggedPageIndex && targetIndex > 0) {
      result.splice(targetIndex - 1, 0, draggedPage);
    } else {
      result.splice(targetIndex, 0, draggedPage);
    }

    return result;
  },

  movePageToFolder(page, targetFolderId) {
    return {
      ...page,
      folderId: targetFolderId
    };
  },

  validateFolderName(name) {
    if (!name || typeof name !== 'string') {
      return false;
    }
    return name.trim().length > 0;
  },

  isDragOverFolder(event) {
    if (!event || !event.target) {
      return null;
    }

    const groupHeader = event.target.closest('.group-header');
    if (groupHeader) {
      return groupHeader.dataset.folderId;
    }

    const groupContainer = event.target.closest('.group-container');
    if (groupContainer) {
      return groupContainer.dataset.folderId;
    }

    return null;
  },

  isDragOverCreateZone(event) {
    if (!event || !event.target) {
      return false;
    }
    return event.target.closest('.drop-zone-create-folder') !== null;
  },

  getDragData(event) {
    try {
      const data = event.dataTransfer.getData('text/plain');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  },

  setDragData(event, data) {
    event.dataTransfer.setData('text/plain', JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  },

  getPageIndexFromEvent(event, pages) {
    const pageItem = event.target.closest('.page-item');
    if (!pageItem) {
      return -1;
    }

    const pageId = pageItem.dataset.pageId;
    return pages.findIndex(p => p.id === pageId);
  },

  normalizePageOrder(pages) {
    return pages.map((page, index) => ({
      ...page,
      order: index + 1
    }));
  }
};
