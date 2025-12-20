const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'mango-icon.svg');
const svg = fs.readFileSync(svgPath);

async function generateIcons() {
  // 192x192 icon
  await sharp(svg)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-192.png'));
  
  // 512x512 icon
  await sharp(svg)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-512.png'));
  
  // Apple touch icon (180x180)
  await sharp(svg)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
  
  // Favicon (32x32)
  await sharp(svg)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, 'public', 'favicon.png'));

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
