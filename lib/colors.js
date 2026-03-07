const DEFAULT_COLOR = '#3b82f6';

function hashString(str) {
  let hash = 0;
  if (!str || str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return hash;
}

function hexToRgb(hex) {
  if (!hex) return null;
  
  let cleanHex = hex.replace('#', '');
  
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  
  if (cleanHex.length !== 6) return null;
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function generateColorFromTagName(tagName) {
  try {
    if (!tagName || typeof tagName !== 'string') {
      return DEFAULT_COLOR;
    }
    
    const normalizedName = tagName.trim().toLowerCase();
    
    if (normalizedName.length === 0) {
      return DEFAULT_COLOR;
    }
    
    const hash = hashString(normalizedName);
    
    const h = ((hash % 360) + 360) % 360;
    const s = 60 + (Math.abs(hash) % 20);
    const l = 50 + (Math.abs(hash) % 20);
    
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
    
  } catch (error) {
    console.error('Error generating color from tag name:', error);
    return DEFAULT_COLOR;
  }
}

function getRelativeLuminance(hexColor) {
  try {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return 0.5;
    
    const sRGB = (value) => {
      const normalized = value / 255;
      return normalized <= 0.03928 
        ? normalized / 12.92 
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    };
    
    const r = sRGB(rgb.r);
    const g = sRGB(rgb.g);
    const b = sRGB(rgb.b);
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    
  } catch (error) {
    console.error('Error calculating relative luminance:', error);
    return 0.5;
  }
}

function getContrastRatio(color1, color2) {
  try {
    const l1 = getRelativeLuminance(color1);
    const l2 = getRelativeLuminance(color2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
    
  } catch (error) {
    console.error('Error calculating contrast ratio:', error);
    return 4.5;
  }
}

function getAccessibleTextColor(bgColor) {
  try {
    const luminance = getRelativeLuminance(bgColor);
    return luminance > 0.5 ? '#000000' : '#ffffff';
  } catch (error) {
    console.error('Error getting accessible text color:', error);
    return '#ffffff';
  }
}

export {
  DEFAULT_COLOR,
  hashString,
  hexToRgb,
  rgbToHex,
  hslToRgb,
  generateColorFromTagName,
  getRelativeLuminance,
  getContrastRatio,
  getAccessibleTextColor
};

