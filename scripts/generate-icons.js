const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [16, 32, 48, 128];
const inputSvg = path.join(__dirname, '../src/icons/icon.svg');
const outputDir = path.join(__dirname, '../src/icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  for (const size of iconSizes) {
    const outputPath = path.join(outputDir, `icon-${size}.png`);
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated icon-${size}.png`);
  }
  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
