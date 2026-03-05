const mockStorage = {};

export function mockChromeStorage() {
  window.chrome = window.chrome || {};
  window.chrome.storage = window.chrome.storage || {};
  window.chrome.storage.sync = window.chrome.storage.sync || {
    get: async function(keys) {
      if (keys === null) {
        return { ...mockStorage };
      }
      if (typeof keys === 'string') {
        return { [keys]: mockStorage[keys] };
      }
      if (Array.isArray(keys)) {
        const result = {};
        keys.forEach(key => {
          if (mockStorage[key] !== undefined) {
            result[key] = mockStorage[key];
          }
        });
        return result;
      }
      if (typeof keys === 'object') {
        const result = {};
        Object.keys(keys).forEach(key => {
          result[key] = mockStorage[key] !== undefined ? mockStorage[key] : keys[key];
        });
        return result;
      }
      return {};
    },
    set: async function(items) {
      Object.keys(items).forEach(key => {
        mockStorage[key] = items[key];
      });
    },
    remove: async function(keys) {
      if (typeof keys === 'string') {
        delete mockStorage[keys];
      } else if (Array.isArray(keys)) {
        keys.forEach(key => delete mockStorage[key]);
      }
    },
    clear: async function() {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    }
  };
}

export function clearMockStorage() {
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
}
