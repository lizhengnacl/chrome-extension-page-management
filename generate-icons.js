const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g${size}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a73e8"/>
        <stop offset="100%" style="stop-color:#34a853"/>
      </linearGradient>
    </defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#g${size})"/>
    <text x="${size/2}" y="${size/2 + size/6}" font-family="Arial" font-size="${size*0.5}" font-weight="bold" fill="white" text-anchor="middle">📑</text>
  </svg>`;
  
  return svg;
}

const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

sizes.forEach(size => {
  const svg = generateIcon(size);
  const filePath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(filePath, svg);
  console.log(`✓ 创建 ${filePath}`);
});

console.log('\n✅ SVG 图标创建成功！请使用在线工具将 SVG 转换为 PNG，或更新 manifest.json 使用 SVG 图标。');
