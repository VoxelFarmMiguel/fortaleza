# La Fortaleza - Web Edition

Classic Spanish text adventure game with retro CRT aesthetic.

## Development

### Files
- `index.dev.html` - Development version (human-readable source code)
- `index.html` - Production version (minified and obfuscated)
- `build.js` - Build script to generate production version

### Making Changes

1. Edit `index.dev.html` (the development version)
2. Run the build script:
   ```bash
   node build.js
   ```
3. This will generate the minified `index.html` for production
4. Commit and push both files

### Build Process

The build script:
- Minifies and obfuscates JavaScript code
- Compresses HTML and CSS
- Reduces file size by ~53%
- Makes source code harder to read via "View Source"

## Deployment

Push to master branch - GitHub Pages will automatically deploy to:
- https://fortressadventure.com
- https://www.fortressadventure.com

## Local Development

Simply open `index.dev.html` in a web browser.
