const fs = require('fs');
const { createCanvas } = require('canvas');

function drawIcon(canvas, size) {
  const ctx = canvas.getContext('2d');
  canvas.width = size;
  canvas.height = size;
  
  // Background - gradient blue
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4285f4');
  gradient.addColorStop(1, '#3367d6');
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, size, size, size * 0.15);
  ctx.fill();
  
  // Draw folder/bookmark icon
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, size / 16);
  
  // Simplified folder/bookmark shape
  const pad = size * 0.15;
  const w = size - pad * 2;
  const h = size - pad * 2;
  
  // Draw pages
  ctx.beginPath();
  ctx.rect(pad, pad + h * 0.25, w * 0.7, h * 0.5);
  ctx.fill();
  
  // Draw folder tab
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad + w * 0.4, pad);
  ctx.lineTo(pad + w * 0.4, pad + h * 0.25);
  ctx.lineTo(pad, pad + h * 0.25);
  ctx.closePath();
  ctx.fill();
  
  // Draw star for bookmark
  ctx.fillStyle = '#fbbc05';
  const starX = pad + w * 0.75;
  const starY = pad + h * 0.4;
  const starR = size * 0.12;
  drawStar(ctx, starX, starY, 5, starR, starR * 0.5);
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;
  
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function roundRect(ctx, x, y, width, height, radius) {
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
}

const sizes = [16, 48, 128];
const iconsDir = __dirname;

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  drawIcon(canvas, size);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`${iconsDir}/icon${size}.png`, buffer);
  console.log(`Generated icon${size}.png created successfully!`);
});

console.log('All icons generated!');
