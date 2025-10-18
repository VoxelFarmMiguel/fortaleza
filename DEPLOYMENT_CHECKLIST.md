# Deployment Checklist for La Fortaleza

## MANDATORY: Before ANY deployment, verify ALL items below:

### 1. Version Number (CRITICAL)
- [ ] Version number incremented from previous version
- [ ] Version follows 2-part format: `1.X` (examples: 1.5, 1.6, 1.123)
- [ ] Version updated in BOTH locations:
  - [ ] Line ~6: `<title>La Fortaleza v1.X - Aventura de Texto</title>`
  - [ ] Line ~598: `<div id="title">LA FORTALEZA <span style="font-size: 12px; opacity: 0.5;">v1.X</span></div>`
- [ ] NEVER use 3-part versioning (3.5.1 is WRONG)

### 2. Build Process
- [ ] Run: `node build.js`
- [ ] Verify `index.html.prod` was generated
- [ ] Copy to production: `cp index.html.prod index.html`

### 3. Testing
- [ ] Test the specific issue/feature being deployed
- [ ] Verify no existing functionality was broken
- [ ] If fixing a bug, test the EXACT command that was reported broken

### 4. Git Commit
- [ ] Commit message describes what changed
- [ ] Commit includes version number in message

### 5. Deployment
- [ ] Files uploaded to server
- [ ] Test on live site (fortressadventure.com)

## NEVER TOUCH THESE CODE SECTIONS (Unless explicitly requested):

### Empty Placeholder in decodedKeys Array
```javascript
const decodedKeys = [
    '',  // key[0] - NOT USED - DO NOT REMOVE THIS LINE
         // This is required for Pascal 1-indexed to JavaScript 0-indexed translation
    'Hay un nombre...',  // key[1]
    'Abrete Sesamo',     // key[2]
    // ...
];
```

**Why**: Pascal uses 1-indexed arrays (`array[1..47]`). The empty string at index 0 allows `decodeLine(2)` to correctly return 'Abrete Sesamo' from `decodedKeys[2]`.

**What breaks if removed**: ALL passwords in the game stop working because indices shift down by one.

## Common Mistakes to Avoid:

1. **Forgetting to increment version**: Each deployment MUST have a new version number
2. **Changing agreed formats**: Never change version format, file structure, etc. without permission
3. **Removing "placeholder" code**: Code that looks unused may be critical (like empty string at decodedKeys[0])
4. **Not testing before deploy**: Always test the specific reported issue
5. **Working outside scope**: Don't modify code outside the requested change area

## Version History:
- 1.7: Fixed password bug by restoring empty placeholder in decodedKeys
- 1.6: Implemented command-based save/load system
- 1.5: Previous version
