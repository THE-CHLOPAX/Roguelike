#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const icongen = require('icon-gen');

const sourcePath = path.join(__dirname, '..', 'src', 'renderer', 'assets', 'game-logo.png');
const outputDir = path.join(__dirname, '..', 'release', 'icons');

// Ensure output directories exist
const macDir = path.join(outputDir, 'mac');
const winDir = path.join(outputDir, 'win');

[macDir, winDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('🎨 Generating app icons from game-logo.png...');
console.log('   Source:', sourcePath);
console.log('   Output:', outputDir);

const options = {
  type: 'png',
  modes: ['ico', 'icns'],
  names: {
    ico: 'icon',
    icns: 'icon',
  },
  sizes: {
    ico: [16, 24, 32, 48, 64, 128, 256],
    icns: [16, 32, 64, 128, 256, 512, 1024],
  },
};

icongen(sourcePath, outputDir, options)
  .then((results) => {
    console.log('✅ Icons generated successfully!');
    console.log('   📁 Results:');
    results.forEach((result) => console.log('      -', result));

    // Move files to correct locations
    const icnsSource = path.join(outputDir, 'app.icns');
    const icoSource = path.join(outputDir, 'app.ico');
    const icnsDest = path.join(macDir, 'icon.icns');
    const icoDest = path.join(winDir, 'icon.ico');

    if (fs.existsSync(icnsSource)) {
      fs.renameSync(icnsSource, icnsDest);
      console.log('   ✓ macOS icon:', icnsDest);
    }

    if (fs.existsSync(icoSource)) {
      fs.renameSync(icoSource, icoDest);
      console.log('   ✓ Windows icon:', icoDest);
    }

    // Clean up any extra PNG files (not needed for Mac/Windows only)
    const pngFiles = fs.readdirSync(outputDir).filter((f) => f.endsWith('.png'));
    pngFiles.forEach((file) => {
      const filePath = path.join(outputDir, file);
      fs.unlinkSync(filePath);
    });

    // Clean up extra .ico file if it exists
    const faviconIco = path.join(outputDir, 'favicon.ico');
    if (fs.existsSync(faviconIco)) {
      fs.unlinkSync(faviconIco);
    }

    console.log('\n✨ All done! Your app icons are ready for Mac and Windows builds.');
  })
  .catch((error) => {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  });
