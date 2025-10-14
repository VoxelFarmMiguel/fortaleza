# La Fortaleza - Web Edition

Classic Spanish text adventure game with retro CRT aesthetic.

## Development

### Files
- `index.dev.html` - Development version (human-readable source code)
- `index.html` - Production version (fully obfuscated)
- `build.js` - Simple minification build (smaller file, less obfuscation)
- `build-full-obfuscate.js` - Full obfuscation build (recommended)

### Making Changes

1. Edit `index.dev.html` (the development version)
2. Run the obfuscation build script:
   ```bash
   node build-full-obfuscate.js
   ```
3. This will generate the fully obfuscated `index.html` for production
4. Commit and push

### Build Process

**Full Obfuscation (Recommended):**
- Encodes all Spanish text strings in Base64
- Stores strings in shuffled, rotated string array
- Hexadecimal variable names
- String array wrapped in functions
- Game text completely unreadable in "View Source"
- File size: ~261 KB

**Simple Minification:**
- Minifies JavaScript and CSS
- Variable name mangling
- Text strings still readable
- File size: ~44 KB

## Deployment

Push to master branch - GitHub Pages will automatically deploy to:
- https://fortressadventure.com
- https://www.fortressadventure.com

## Local Development

Simply open `index.dev.html` in a web browser.
