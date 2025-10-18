#!/bin/bash
# Pre-commit hook to verify deployment requirements
# To install: cp pre-commit-hook.sh ../.git/hooks/pre-commit && chmod +x ../.git/hooks/pre-commit

set -e

echo "Running pre-commit checks..."

# Check if index.dev.html is being committed
if git diff --cached --name-only | grep -q "index.dev.html"; then

    # Extract version from title tag
    TITLE_VERSION=$(git diff --cached index.dev.html | grep "^\+.*<title>" | sed -E 's/.*v([0-9]+\.[0-9]+).*/\1/')

    # Extract version from UI display
    UI_VERSION=$(git diff --cached index.dev.html | grep "^\+.*LA FORTALEZA.*v[0-9]" | sed -E 's/.*v([0-9]+\.[0-9]+).*/\1/')

    if [ -n "$TITLE_VERSION" ] || [ -n "$UI_VERSION" ]; then
        echo "Version check:"

        # Check if both versions match
        if [ -n "$TITLE_VERSION" ] && [ -n "$UI_VERSION" ]; then
            if [ "$TITLE_VERSION" != "$UI_VERSION" ]; then
                echo "ERROR: Version mismatch!"
                echo "  Title tag: v$TITLE_VERSION"
                echo "  UI display: v$UI_VERSION"
                echo "Both versions must match."
                exit 1
            fi
        fi

        # Check version format (must be 1.X)
        VERSION="${TITLE_VERSION:-$UI_VERSION}"
        if [ -n "$VERSION" ]; then
            if ! echo "$VERSION" | grep -qE '^1\.[0-9]+$'; then
                echo "ERROR: Invalid version format: $VERSION"
                echo "Must be 2-part format: 1.X (examples: 1.5, 1.6, 1.123)"
                exit 1
            fi
            echo "  Version: $VERSION (OK)"
        fi
    fi

    # Check for empty placeholder in decodedKeys
    if git diff --cached index.dev.html | grep -A1 "^\+.*const decodedKeys = \[" | grep -q "^\+.*''"; then
        echo "  decodedKeys placeholder: Present (OK)"
    elif git diff --cached index.dev.html | grep -q "^\-.*'',.*// key\[0\]"; then
        echo "ERROR: Empty placeholder at decodedKeys[0] is being removed!"
        echo "This will break ALL passwords in the game."
        echo "See DEPLOYMENT_CHECKLIST.md for details."
        exit 1
    fi

    # Check if production files are built
    if [ ! -f "index.html.prod" ] || [ "index.dev.html" -nt "index.html.prod" ]; then
        echo "WARNING: index.html.prod is outdated or missing"
        echo "Run: node build.js"
    fi

    if [ ! -f "index.html" ] || [ "index.html.prod" -nt "index.html" ]; then
        echo "WARNING: index.html needs to be updated"
        echo "Run: cp index.html.prod index.html"
    fi
fi

echo "Pre-commit checks passed!"
