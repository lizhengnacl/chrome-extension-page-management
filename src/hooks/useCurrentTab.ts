import { useState, useEffect } from 'react'

interface CurrentTab {
  url: string
  title: string
  favicon?: string
}

export const useCurrentTab = () => {
  const [currentTab, setCurrentTab] = useState<CurrentTab | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getCurrentTab = async () => {
      try {
        if (chrome.tabs && chrome.tabs.query) {
          const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
          })

          if (tab && tab.url && tab.title) {
            setCurrentTab({
              url: tab.url,
              title: tab.title
            })
          }
        }
      } catch (error) {
        console.error('获取当前标签页失败:', error)
      } finally {
        setLoading(false)
      }
    }

    getCurrentTab()
  }, [])

  return { currentTab, loading }
}
