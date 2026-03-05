import { showNotification } from './utils.js';

export const UIComponents = {
  showSuccessNotification(message) {
    try {
      showNotification(message, 'success');
    } catch (error) {
      console.error('显示成功通知失败:', error);
    }
  },

  showErrorNotification(message) {
    try {
      showNotification(message, 'error');
    } catch (error) {
      console.error('显示错误通知失败:', error);
    }
  },

  showInfoNotification(message) {
    try {
      showNotification(message, 'info');
    } catch (error) {
      console.error('显示信息通知失败:', error);
    }
  },

  showLoading(container) {
    try {
      const loadingElement = document.createElement('div');
      loadingElement.className = 'loading-spinner';
      loadingElement.innerHTML = `
        <div class="spinner"></div>
        <span class="loading-text">加载中...</span>
      `;
      container.appendChild(loadingElement);
      return loadingElement;
    } catch (error) {
      console.error('显示加载状态失败:', error);
      return null;
    }
  },

  hideLoading(container) {
    try {
      const loadingElement = container.querySelector('.loading-spinner');
      if (loadingElement) {
        loadingElement.remove();
      }
    } catch (error) {
      console.error('隐藏加载状态失败:', error);
    }
  },

  createButton(text, options = {}) {
    try {
      const button = document.createElement('button');
      button.textContent = text;
      button.className = 'btn';
      
      if (options.type) {
        button.classList.add(`btn-${options.type}`);
      }
      
      if (options.onClick) {
        button.addEventListener('click', options.onClick);
      }
      
      if (options.icon) {
        button.innerHTML = `<i data-feather="${options.icon}"></i> ${text}`;
      }
      
      if (options.small) {
        button.classList.add('btn-small');
      }
      
      return button;
    } catch (error) {
      console.error('创建按钮失败:', error);
      return null;
    }
  },

  enhanceSearchInput(inputElement) {
    try {
      if (!inputElement) return;
      
      inputElement.addEventListener('focus', function() {
        this.select();
      });
      
      inputElement.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          this.blur();
        }
      });
    } catch (error) {
      console.error('增强搜索框失败:', error);
    }
  },

  addRippleEffect(buttonElement) {
    try {
      if (!buttonElement) return;
      
      buttonElement.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
      });
    } catch (error) {
      console.error('添加波纹效果失败:', error);
    }
  }
};
