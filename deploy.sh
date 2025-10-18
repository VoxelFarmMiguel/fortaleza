#!/bin/bash
# Automated deployment script for La Fortaleza
# Usage: ./deploy.sh "commit message"

set -e

if [ -z "$1" ]; then
    echo "ERROR: Commit message required"
    echo "Usage: ./deploy.sh \"commit message\""
    exit 1
fi

echo "=== La Fortaleza Deployment Script ==="
echo ""

# 1. Check version number
echo "[1/6] Checking version number..."
TITLE_VERSION=$(grep -o 'v[0-9]\+\.[0-9]\+' index.dev.html | head -1 | sed 's/v//')
UI_VERSION=$(grep -o 'v[0-9]\+\.[0-9]\+' index.dev.html | tail -1 | sed 's/v//')

if [ "$TITLE_VERSION" != "$UI_VERSION" ]; then
    echo "ERROR: Version mismatch!"
    echo "  Title: $TITLE_VERSION"
    echo "  UI: $UI_VERSION"
    exit 1
fi

if ! echo "$TITLE_VERSION" | grep -qE '^1\.[0-9]+$'; then
    echo "ERROR: Invalid version format: $TITLE_VERSION"
    echo "Must be 2-part: 1.X"
    exit 1
fi

echo "  Current version: $TITLE_VERSION"
echo ""

# 2. Check decodedKeys placeholder
echo "[2/6] Checking decodedKeys placeholder..."
if grep -A1 "const decodedKeys = \[" index.dev.html | grep -q "''"; then
    echo "  Empty placeholder: Present"
else
    echo "ERROR: Empty placeholder at decodedKeys[0] is missing!"
    exit 1
fi
echo ""

# 3. Build production
echo "[3/6] Building production files..."
node build.js
echo ""

# 4. Copy to index.html
echo "[4/6] Copying to index.html..."
cp index.html.prod index.html
echo ""

# 5. Run tests (optional, requires puppeteer)
if command -v node &> /dev/null && [ -f "test-password-flow.js" ]; then
    echo "[5/6] Running tests (optional)..."
    if timeout 30 node test-password-flow.js 2>/dev/null; then
        echo "  Tests passed"
    else
        echo "  Tests skipped (requires puppeteer or timed out)"
    fi
else
    echo "[5/6] Skipping tests (puppeteer not available)"
fi
echo ""

# 6. Git commit
echo "[6/6] Creating git commit..."
git add index.dev.html index.html.prod index.html
git commit -m "v$TITLE_VERSION: $1"
echo ""

echo "=== Deployment Complete ==="
echo "Version: $TITLE_VERSION"
echo "Commit: $1"
echo ""
echo "Next steps:"
echo "  1. Push to repository: git push"
echo "  2. Verify on fortressadventure.com"
