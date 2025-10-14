#!/usr/bin/env node

const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { minify: minifyHTML } = require('html-minifier-terser');

async function build() {
    console.log('Building fully obfuscated production version...');

    // Read the source HTML
    const html = fs.readFileSync('index.dev.html', 'utf8');

    // Extract JavaScript between <script> tags
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
        console.error('Could not find script tag!');
        process.exit(1);
    }

    const jsCode = scriptMatch[1];

    console.log('Obfuscating JavaScript and encoding strings...');

    // Obfuscate with string array encoding
    const obfuscationResult = JavaScriptObfuscator.obfuscate(jsCode, {
        compact: true,
        controlFlowFlattening: false, // Keep false to avoid breaking game logic
        deadCodeInjection: false,
        debugProtection: false,
        debugProtectionInterval: 0,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: false,
        renameGlobals: false,
        selfDefending: false,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayEncoding: ['base64'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 2,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 4,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 0.75,
        transformObjectKeys: false,
        unicodeEscapeSequence: false
    });

    const obfuscatedJS = obfuscationResult.getObfuscatedCode();

    // Replace the JavaScript in HTML
    let productionHTML = html.replace(
        /<script>[\s\S]*?<\/script>/,
        `<script>${obfuscatedJS}</script>`
    );

    console.log('Minifying HTML...');

    // Minify the entire HTML
    productionHTML = await minifyHTML(productionHTML, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: false // Already obfuscated
    });

    // Write production file
    fs.writeFileSync('index.html', productionHTML);

    const originalSize = Buffer.byteLength(html, 'utf8');
    const obfuscatedSize = Buffer.byteLength(productionHTML, 'utf8');
    const sizeChange = ((obfuscatedSize / originalSize - 1) * 100).toFixed(1);

    console.log('\n✅ Build complete!');
    console.log(`Original size: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`Obfuscated size: ${(obfuscatedSize / 1024).toFixed(1)} KB`);
    console.log(`Size change: ${sizeChange > 0 ? '+' : ''}${sizeChange}%`);
    console.log('\nProduction file: index.html');
    console.log('✓ JavaScript obfuscated');
    console.log('✓ Strings encoded in Base64');
    console.log('✓ Variable names hexadecimal');
    console.log('✓ String array shuffled and rotated');
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
