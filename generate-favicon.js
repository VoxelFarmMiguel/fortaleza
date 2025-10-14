#!/usr/bin/env node

const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a 32x32 favicon
const size = 32;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Black background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, size, size);

// Green border (fortress walls)
ctx.strokeStyle = '#39FF14';
ctx.lineWidth = 2;
ctx.strokeRect(2, 2, size - 4, size - 4);

// Draw a simple fortress/castle icon
// Top towers
ctx.fillStyle = '#39FF14';

// Left tower
ctx.fillRect(4, 8, 6, 10);
ctx.fillRect(5, 6, 4, 2); // battlement

// Right tower
ctx.fillRect(22, 8, 6, 10);
ctx.fillRect(23, 6, 4, 2); // battlement

// Center tower (taller)
ctx.fillRect(13, 4, 6, 14);
ctx.fillRect(14, 2, 4, 2); // battlement

// Gate/door
ctx.fillStyle = '#000000';
ctx.fillRect(14, 12, 4, 6);

// Green outline for gate
ctx.strokeStyle = '#39FF14';
ctx.lineWidth = 1;
ctx.strokeRect(14, 12, 4, 6);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('favicon.png', buffer);

console.log('✅ Favicon generated: favicon.png (32x32)');
console.log('   Simple fortress icon in retro green on black background');
console.log('   You can edit this file in any image editor!');
