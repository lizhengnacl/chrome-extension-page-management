import { Storage } from './storage.js';
import { supportsColorSchemePreference, getSystemColorScheme } from './utils.js';

const defaultThemeConfig = {
  mode: 'system',
  currentTheme: 'light',
  lastUpdatedAt: new Date().toISOString()
};

let systemThemeChangeListener = null;

export const ThemeManager = {
  async getThemeConfig() {
    try {
      const data = await Storage.getAllData();
      const settings = data.settings || {};
      return {
        ...defaultThemeConfig,
        ...settings.theme
      };
    } catch (error) {
      console.error('获取主题配置失败:', error);
      return { ...defaultThemeConfig };
    }
  },

  async saveThemeConfig(config) {
    try {
      const data = await Storage.getAllData();
      data.settings = data.settings || {};
      data.settings.theme = {
        ...defaultThemeConfig,
        ...config,
        lastUpdatedAt: new Date().toISOString()
      };
      await Storage.saveAllData(data);
    } catch (error) {
      console.error('保存主题配置失败:', error);
      throw new Error('保存主题配置失败');
    }
  },

  async setThemeMode(mode) {
    try {
      if (!['system', 'light', 'dark'].includes(mode)) {
        throw new Error('无效的主题模式');
      }

      const config = await this.getThemeConfig();
      config.mode = mode;
      
      if (mode === 'system') {
        config.currentTheme = this.getSystemColorScheme();
      } else {
        config.currentTheme = mode;
      }

      await this.saveThemeConfig(config);
      this.applyTheme(config.currentTheme);
    } catch (error) {
      console.error('设置主题模式失败:', error);
      throw new Error('设置主题模式失败');
    }
  },

  applyTheme(theme) {
    try {
      const html = document.documentElement;
      html.classList.remove('theme-light', 'theme-dark');
      html.classList.add(`theme-${theme}`);
      
      if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
      } else {
        html.setAttribute('data-theme', 'light');
      }
    } catch (error) {
      console.error('应用主题失败:', error);
    }
  },

  watchSystemThemeChange(callback) {
    try {
      if (!supportsColorSchemePreference()) {
        return;
      }

      if (systemThemeChangeListener) {
        systemThemeChangeListener.removeEventListener('change', this.handleSystemThemeChange);
      }

      systemThemeChangeListener = window.matchMedia('(prefers-color-scheme: dark)');
      
      this.handleSystemThemeChange = async (e) => {
        const config = await this.getThemeConfig();
        if (config.mode === 'system') {
          const newTheme = e.matches ? 'dark' : 'light';
          config.currentTheme = newTheme;
          await this.saveThemeConfig(config);
          this.applyTheme(newTheme);
          if (callback) callback(newTheme);
        }
      };

      systemThemeChangeListener.addEventListener('change', this.handleSystemThemeChange);
    } catch (error) {
      console.error('监听系统主题变化失败:', error);
    }
  },

  stopWatchingSystemThemeChange() {
    try {
      if (systemThemeChangeListener) {
        systemThemeChangeListener.removeEventListener('change', this.handleSystemThemeChange);
        systemThemeChangeListener = null;
      }
    } catch (error) {
      console.error('停止监听系统主题变化失败:', error);
    }
  },

  async refreshTheme() {
    try {
      const config = await this.getThemeConfig();
      const theme = this.getEffectiveTheme(config);
      this.applyTheme(theme);
    } catch (error) {
      console.error('刷新主题失败:', error);
    }
  },

  getEffectiveTheme(config) {
    try {
      if (!config) {
        return 'light';
      }
      if (config.mode === 'system') {
        return this.getSystemColorScheme();
      }
      return config.currentTheme;
    } catch (error) {
      console.error('获取有效主题失败:', error);
      return 'light';
    }
  },

  getSystemColorScheme() {
    return getSystemColorScheme();
  },

  supportsColorSchemePreference() {
    return supportsColorSchemePreference();
  },

  async initTheme() {
    try {
      const config = await this.getThemeConfig();
      let effectiveTheme = config.currentTheme;

      if (config.mode === 'system') {
        effectiveTheme = this.getSystemColorScheme();
        config.currentTheme = effectiveTheme;
        await this.saveThemeConfig(config);
      }

      this.applyTheme(effectiveTheme);
      this.watchSystemThemeChange();
    } catch (error) {
      console.error('初始化主题失败:', error);
    }
  }
};
