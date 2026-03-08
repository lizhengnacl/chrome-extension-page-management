const STORAGE_KEY = 'pageManagementData'
const STORAGE_VERSION = '1.0'

function getDefaultStorageData() {
  return {
    version: STORAGE_VERSION,
    pages: [],
    tags: [],
    groups: []
  }
}

function getStorageData() {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.get(STORAGE_KEY, (result) => {
        if (result[STORAGE_KEY]) {
          try {
            const data = JSON.parse(result[STORAGE_KEY])
            resolve(data)
          } catch {
            resolve(getDefaultStorageData())
          }
        } else {
          resolve(getDefaultStorageData())
        }
      })
    } catch {
      resolve(getDefaultStorageData())
    }
  })
}

function saveStorageData(data) {
  return new Promise((resolve) => {
    try {
      chrome.storage.sync.set({
        [STORAGE_KEY]: JSON.stringify(data)
      }, () => {
        resolve()
      })
    } catch {
      resolve()
    }
  })
}

function getFaviconUrl(url) {
  try {
    const urlObj = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`
  } catch {
    return getDefaultFavicon()
  }
}

function getDefaultFavicon() {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNDRkQ1RkUiLz4KPHBhdGggZD0iTTE2IDI0SDQ4VjQwSDE2VjI0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4='
}

function extractBookmarks(nodes) {
  const pages = []
  const now = Date.now()

  nodes.forEach(node => {
    if (node.url) {
      pages.push({
        id: node.id,
        url: node.url,
        title: node.title || node.url,
        favicon: getFaviconUrl(node.url),
        tags: [],
        groups: [],
        isStarred: false,
        createdAt: node.dateAdded || now,
        updatedAt: now
      })
    }
    if (node.children) {
      pages.push(...extractBookmarks(node.children))
    }
  })

  return pages
}

function importFromBookmarks() {
  return new Promise((resolve) => {
    try {
      chrome.bookmarks.getTree((bookmarkTreeNodes) => {
        const pages = extractBookmarks(bookmarkTreeNodes)
        resolve(pages)
      })
    } catch {
      resolve([])
    }
  })
}

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Chrome 页面管理插件已安装')

  if (details.reason === 'install') {
    try {
      const existingData = await getStorageData()
      if (existingData.pages.length === 0 && existingData.tags.length === 0 && existingData.groups.length === 0) {
        console.log('首次安装，尝试从书签导入数据...')
        try {
          const importedPages = await importFromBookmarks()
          const defaultData = getDefaultStorageData()
          await saveStorageData({
            ...defaultData,
            pages: importedPages
          })
          console.log('书签导入成功')
        } catch (error) {
          console.error('书签导入失败:', error)
          await saveStorageData(getDefaultStorageData())
        }
      }
    } catch (error) {
      console.error('初始化失败:', error)
      try {
        await saveStorageData(getDefaultStorageData())
      } catch (saveError) {
        console.error('保存默认数据失败:', saveError)
      }
    }
  } else if (details.reason === 'update') {
    console.log('插件已更新')
    try {
      const data = await getStorageData()
      await saveStorageData(data)
    } catch (error) {
      console.error('更新后数据处理失败:', error)
    }
  }
})

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'importBookmarks') {
    importFromBookmarks()
      .then(async (importedPages) => {
        const defaultData = getDefaultStorageData()
        const data = {
          ...defaultData,
          pages: importedPages
        }
        await saveStorageData(data)
        sendResponse({ success: true, data })
      })
      .catch((error) => {
        console.error('导入书签失败:', error)
        sendResponse({ success: false, error: String(error) })
      })
    return true
  }

  if (request.action === 'resetData') {
    saveStorageData(getDefaultStorageData())
      .then(() => {
        sendResponse({ success: true })
      })
      .catch((error) => {
        console.error('重置数据失败:', error)
        sendResponse({ success: false, error: String(error) })
      })
    return true
  }
})

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    console.log('存储数据已更新:', changes)
  }
})
