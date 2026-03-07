const STORAGE_VERSION = '1.0';

const DEFAULT_DATA = {
  version: STORAGE_VERSION,
  pages: [],
  groups: [],
  tags: []
};

const DEFAULT_TAG_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899'
];

const STORAGE_KEY = 'pageManagerData';

const TOAST_DURATION = 3000;

const POPUP_WIDTH = 400;
const POPUP_HEIGHT = 500;

export {
  STORAGE_VERSION,
  DEFAULT_DATA,
  DEFAULT_TAG_COLORS,
  STORAGE_KEY,
  TOAST_DURATION,
  POPUP_WIDTH,
  POPUP_HEIGHT
};
