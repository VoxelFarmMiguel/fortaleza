#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertPngToJpg(inputPath, outputPath) {
    try {
        await sharp(inputPath)
            .jpeg({ quality: 85, progressive: true })
            .toFile(outputPath);

        const pngSize = fs.statSync(inputPath).size;
        const jpgSize = fs.statSync(outputPath).size;
        const savings = ((1 - jpgSize / pngSize) * 100).toFixed(1);

        console.log(`✓ ${path.basename(inputPath)} → ${path.basename(outputPath)} (${savings}% smaller)`);
        return { pngSize, jpgSize, savings };
    } catch (error) {
        console.error(`✗ Error converting ${inputPath}:`, error.message);
        return null;
    }
}

async function convertAllImages() {
    console.log('Converting PNG images to JPG...\n');

    const imagesDir = './images';
    const files = fs.readdirSync(imagesDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));

    let totalPngSize = 0;
    let totalJpgSize = 0;
    let converted = 0;

    for (const file of pngFiles) {
        const inputPath = path.join(imagesDir, file);
        const outputPath = path.join(imagesDir, file.replace('.png', '.jpg'));

        const result = await convertPngToJpg(inputPath, outputPath);
        if (result) {
            totalPngSize += result.pngSize;
            totalJpgSize += result.jpgSize;
            converted++;
        }
    }

    const totalSavings = ((1 - totalJpgSize / totalPngSize) * 100).toFixed(1);

    console.log(`\n✅ Conversion complete!`);
    console.log(`${converted} images converted`);
    console.log(`Original PNG size: ${(totalPngSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Compressed JPG size: ${(totalJpgSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total savings: ${totalSavings}%`);
    console.log(`\nPNG files kept as high-quality source.`);
    console.log(`JPG files will be used in production.`);
}

convertAllImages().catch(err => {
    console.error('Conversion failed:', err);
    process.exit(1);
});
