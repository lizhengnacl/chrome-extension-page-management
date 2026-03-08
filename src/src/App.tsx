/**
 * App组件
 * Chrome插件的入口组件，根据环境渲染Pop-up或New Tab界面
 */

import React, { useEffect } from 'react';
import Popup from './popup';
import NewTab from './newtab';

// 配置Tailwind主题
const configureTailwind = () => {
  if (typeof window !== 'undefined' && (window as any).tailwind) {
    (window as any).tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
            },
          },
          animation: {
            'fade-in': 'fadeIn 0.3s ease-out',
            'slide-up': 'slideUp 0.3s ease-out',
          },
          keyframes: {
            fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
            },
            slideUp: {
              '0%': { opacity: '0', transform: 'translateY(10px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
          },
        },
      },
    };
  }
};

const App: React.FC = () => {
  useEffect(() => {
    configureTailwind();
  }, []);

  // 根据URL路径判断当前环境
  const isPopup = window.location.pathname.includes('popup');
  const isNewTab = window.location.pathname.includes('newtab');

  // 如果是Pop-up窗口
  if (isPopup) {
    return <Popup />;
  }

  // 如果是New Tab页面
  if (isNewTab) {
    return <NewTab />;
  }

  // 默认显示New Tab界面（在开发环境中）
  return <NewTab />;
};

export default App;