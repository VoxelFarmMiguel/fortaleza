# La Fortaleza - Web Edition

Classic Spanish text adventure game with retro CRT aesthetic.

## Quick Start

### Making Changes - Use Automated Deployment

**RECOMMENDED: Use the deployment script to avoid mistakes**

```bash
./deploy.sh "description of changes"
```

This automated script will:
1. Check version number format and consistency
2. Verify critical code sections are intact
3. Build production files
4. Create properly formatted git commit
5. Remind you to push and verify

### Manual Deployment (Not Recommended)

If you must deploy manually, follow **EVERY STEP** in `DEPLOYMENT_CHECKLIST.md`

## Files

### Source Files
- `index.dev.html` - **Main source file** (edit this)
- `index.html.prod` - Minified production build (generated)
- `index.html` - Production deployment (copy of index.html.prod)

### Build Scripts
- `build.js` - Simple minification build (current method)
- `build-full-obfuscate.js` - Full obfuscation build (available but not used)

### Automation & Safety
- `deploy.sh` - **Automated deployment script with safety checks**
- `pre-commit-hook.sh` - Git hook to prevent common mistakes (optional)
- `DEPLOYMENT_CHECKLIST.md` - Complete deployment requirements and rules
- `README.md` - This file

### Testing
- `debug-password.js` - Test password functionality
- `test-password-flow.js` - Test password + save/load flow

## Critical Rules

### 1. Version Numbering (MANDATORY)
- **Format**: Always `1.X` (2-part only)
- **Examples**: 1.5, 1.6, 1.7, 1.123 ✓
- **Wrong**: 3.5.1, 2.0.0, v1.5.2 ✗
- **Increment**: EVERY deployment MUST increment version
- **Locations**: Update in TWO places:
  - Line ~6: `<title>La Fortaleza v1.X - Aventura de Texto</title>`
  - Line ~598: `<div id="title">LA FORTALEZA <span>v1.X</span></div>`

### 2. Protected Code Sections (DO NOT MODIFY)

#### Empty Placeholder in decodedKeys Array
```javascript
const decodedKeys = [
    '',  // key[0] - DO NOT REMOVE THIS LINE
    'Hay un nombre...',  // key[1]
    'Abrete Sesamo',     // key[2]
    // ...
];
```

**Critical**: The empty string at `decodedKeys[0]` is REQUIRED for Pascal 1-indexed to JavaScript 0-indexed translation.

**What breaks if removed**: ALL passwords in the entire game will stop working because every `decodeLine(N)` call will return the wrong key.

### 3. Build Process

```bash
# Build production files
node build.js

# Copy to production
cp index.html.prod index.html

# Commit with proper version
git add index.dev.html index.html.prod index.html
git commit -m "v1.X: description"
```

## Common Mistakes to Avoid

1. ✗ Forgetting to increment version number
2. ✗ Using 3-part version format (1.5.1)
3. ✗ Removing "placeholder" or "unused" looking code
4. ✗ Not testing the specific bug being fixed
5. ✗ Modifying code outside the requested change area
6. ✗ Deploying without running build.js first

## Deployment

Push to master branch - GitHub Pages will automatically deploy to:
- https://fortressadventure.com
- https://www.fortressadventure.com

**After pushing**: Always verify the live site works correctly.

## Local Development

Simply open `index.dev.html` in a web browser.

## Version History

- **1.7**: Fixed password bug by restoring empty placeholder in decodedKeys
- **1.6**: Implemented command-based save/load system
- **1.5**: Previous stable version

## Getting Help

- **Deployment issues**: See `DEPLOYMENT_CHECKLIST.md`
- **Version questions**: Only use 2-part format (1.X)
- **Code questions**: Check original Pascal source at `../FORT1.PAS`
