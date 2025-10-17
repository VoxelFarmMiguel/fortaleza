#!/usr/bin/env node

const fs = require('fs');
const { minify: minifyJS } = require('terser');
const { minify: minifyHTML } = require('html-minifier-terser');

async function build() {
    console.log('Building production version...');

    // Read the source HTML
    const html = fs.readFileSync('index.dev.html', 'utf8');

    // Extract JavaScript between <script> tags
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
        console.error('Could not find script tag!');
        process.exit(1);
    }

    const jsCode = scriptMatch[1];

    console.log('Minifying and obfuscating JavaScript...');

    // Minify and obfuscate JavaScript
    const minifiedJS = await minifyJS(jsCode, {
        compress: {
            dead_code: true,
            drop_console: false, // Keep console for debugging if needed
            drop_debugger: true,
            keep_classnames: true, // MUST keep class names for instanceof checks!
            keep_fnames: false,
            passes: 2
        },
        mangle: {
            toplevel: true,
            properties: false // Don't mangle property names to avoid breaking the game
        },
        format: {
            comments: false,
            beautify: false
        }
    });

    if (minifiedJS.error) {
        console.error('Error minifying JavaScript:', minifiedJS.error);
        process.exit(1);
    }

    // Replace the JavaScript in HTML
    let productionHTML = html.replace(
        /<script>[\s\S]*?<\/script>/,
        `<script>${minifiedJS.code}</script>`
    );

    console.log('Minifying HTML...');

    // Minify the entire HTML
    productionHTML = await minifyHTML(productionHTML, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: false // Already minified
    });

    // Write production file
    fs.writeFileSync('index.html.prod', productionHTML);

    const originalSize = Buffer.byteLength(html, 'utf8');
    const minifiedSize = Buffer.byteLength(productionHTML, 'utf8');
    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    console.log('\n✅ Build complete!');
    console.log(`Original size: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`Minified size: ${(minifiedSize / 1024).toFixed(1)} KB`);
    console.log(`Savings: ${savings}%`);
    console.log('\nProduction file: index.html.prod');
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
