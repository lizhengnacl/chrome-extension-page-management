import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { writeFileSync, readFileSync, copyFileSync } from 'fs'

const copyManifest = () => {
  return {
    name: 'copy-manifest',
    writeBundle() {
      writeFileSync(resolve(__dirname, 'dist', 'manifest.json'), JSON.stringify({
        "manifest_version": 3,
        "name": "Chrome 页面管理插件",
        "version": "0.1.0",
        "description": "高效管理、分类和快速访问常用网页",
        "permissions": ["storage", "tabs", "bookmarks"],
        "action": {
          "default_popup": "popup.html",
          "default_icon": {
            "16": "icons/icon16.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png"
          }
        },
        "chrome_url_overrides": {
          "newtab": "newtab.html"
        },
        "background": {
          "service_worker": "background.js"
        },
        "icons": {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        }
      }, null, 2))
      
      const bgContent = readFileSync(resolve(__dirname, 'src', 'background-standalone.js'), 'utf-8')
      writeFileSync(resolve(__dirname, 'dist', 'background.js'), bgContent)
    }
  }
}

export default defineConfig({
  plugins: [react(), copyManifest()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        newtab: resolve(__dirname, 'newtab.html')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public'
})
