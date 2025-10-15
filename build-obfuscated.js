#!/usr/bin/env node

const fs = require('fs');
const { minify: minifyJS } = require('terser');
const { minify: minifyHTML } = require('html-minifier-terser');

// Base64 encode strings to hide Spanish text
function encodeStrings(code) {
    // Find all Spanish string literals (containing common Spanish characters)
    const stringPattern = /(['"`])((?:(?!\1)[^\\]|\\.)*)(\1)/g;

    let encoded = code;
    const replacements = new Map();
    let counter = 0;

    // First pass: collect all strings that should be encoded
    code.replace(stringPattern, (match, quote, content, endQuote) => {
        // Only encode strings with Spanish characters or longer than 20 chars
        if (content.length > 20 || /[áéíóúñ¿¡]/i.test(content)) {
            const key = `__STR_${counter}__`;
            replacements.set(key, content);
            counter++;
        }
        return match;
    });

    // Add decoder function at the start
    const decoder = `
        const _d = s => {
            try {
                return atob(s);
            } catch(e) {
                return s;
            }
        };
        const _s = {${Array.from(replacements.entries()).map(([k, v]) =>
            `"${k}": _d("${Buffer.from(v).toString('base64')}")`
        ).join(',')}};
    `;

    // Second pass: replace strings with encoded versions
    encoded = code.replace(stringPattern, (match, quote, content, endQuote) => {
        const key = Array.from(replacements.entries()).find(([k, v]) => v === content)?.[0];
        if (key) {
            return `_s["${key}"]`;
        }
        return match;
    });

    return decoder + encoded;
}

async function build() {
    console.log('Building obfuscated production version...');

    // Read the source HTML
    const html = fs.readFileSync('index.dev.html', 'utf8');

    // Extract JavaScript between <script> tags
    const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!scriptMatch) {
        console.error('Could not find script tag!');
        process.exit(1);
    }

    let jsCode = scriptMatch[1];

    console.log('Encoding Spanish text strings...');
    jsCode = encodeStrings(jsCode);

    console.log('Minifying and obfuscating JavaScript...');

    // Minify and obfuscate JavaScript
    const minifiedJS = await minifyJS(jsCode, {
        compress: {
            dead_code: true,
            drop_console: false,
            drop_debugger: true,
            keep_classnames: false,
            keep_fnames: false,
            passes: 3,
            unsafe: true,
            unsafe_comps: true,
            unsafe_math: true
        },
        mangle: {
            toplevel: true,
            properties: false
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
        minifyJS: false
    });

    // Write production file
    fs.writeFileSync('index.html', productionHTML);

    const originalSize = Buffer.byteLength(html, 'utf8');
    const minifiedSize = Buffer.byteLength(productionHTML, 'utf8');
    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    console.log('\n✅ Build complete!');
    console.log(`Original size: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`Obfuscated size: ${(minifiedSize / 1024).toFixed(1)} KB`);
    console.log(`Savings: ${savings}%`);
    console.log('\nProduction file: index.html');
    console.log('Spanish text is now Base64 encoded and harder to read!');
}

build().catch(err => {
    console.error('Build failed:', err);
    process.exit(1);
});
