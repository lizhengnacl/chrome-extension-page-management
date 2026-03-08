import { getStorageData, saveStorageData, getDefaultStorageData } from '@/utils/storage'
import { importFromBookmarks } from '@/utils/bookmark'

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
