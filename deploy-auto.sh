#!/bin/bash
# Auto-increment version and deploy
# Usage: ./deploy-auto.sh "commit message"

set -e

if [ -z "$1" ]; then
    echo "ERROR: Commit message required"
    echo "Usage: ./deploy-auto.sh \"commit message\""
    exit 1
fi

COMMIT_MSG="$1"

echo "=== Auto-Deploy Script ==="
echo ""

# 1. Read current version
CURRENT_VERSION=$(cat VERSION | head -1)
echo "[1/6] Current version: $CURRENT_VERSION"

# 2. Auto-increment version (1.X format)
MAJOR=$(echo $CURRENT_VERSION | cut -d. -f1)
MINOR=$(echo $CURRENT_VERSION | cut -d. -f2)
NEW_MINOR=$((MINOR + 1))
NEW_VERSION="${MAJOR}.${NEW_MINOR}"

echo "[2/6] New version: $NEW_VERSION"

# 3. Update VERSION file
echo "$NEW_VERSION" > VERSION
echo "" >> VERSION
echo "# Version Format: 1.X (2-part only)" >> VERSION
echo "# MUST increment with EVERY deployment" >> VERSION
echo "# Examples: 1.5, 1.6, 1.7, 1.123" >> VERSION
echo "# NEVER use 3-part: 3.5.1 ✗" >> VERSION

echo "[3/6] Updated VERSION file"

# 4. Update HTML title
sed -i.bak "s/<title>La Fortaleza - Aventura de Texto (v[0-9.]*)<\/title>/<title>La Fortaleza - Aventura de Texto (v$NEW_VERSION)<\/title>/" index.dev.html
rm -f index.dev.html.bak

echo "[4/6] Updated HTML title"

# 5. Build
echo "[5/6] Building..."
node build-full-obfuscate.js

# 6. Commit and push
echo "[6/6] Deploying..."
git add VERSION index.dev.html index.html
git commit -m "v${NEW_VERSION}: ${COMMIT_MSG}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push

echo ""
echo "=== Deployment Complete ==="
echo "Version: $CURRENT_VERSION → $NEW_VERSION"
echo "Message: $COMMIT_MSG"
echo ""
echo "Site will update on GitHub Pages in 1-2 minutes"
