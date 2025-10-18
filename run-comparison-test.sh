#!/bin/bash

set -e

echo "=== Running Comparison Test ==="
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    exit 1
fi

# Check if puppeteer is installed
if ! npm list puppeteer &> /dev/null; then
    echo "Installing puppeteer..."
    npm install puppeteer
fi

cd /Users/miguelcepero/Downloads/fortaleza-master

echo "Step 1: Building Pascal version with Docker..."
echo "Pulling Docker image if needed..."
docker pull davidmpaz/dosbox-tp7:1.1-amd64 2>&1 | grep -v "Pulling from" || true

echo ""
echo "Step 2: Compiling Pascal code..."

# Create a DOSBox command script
cat > /tmp/dosbox-build.conf << 'EOF'
[autoexec]
mount d /app/src
d:
build.bat
exit
EOF

# Run build in Docker
docker run --rm \
    -v $(pwd):/app/src \
    -v /tmp/dosbox-build.conf:/root/.dosboxrc \
    davidmpaz/dosbox-tp7:1.1-amd64 \
    dosbox -conf /root/.dosboxrc -exit 2>&1 | tail -20

echo ""
echo "Step 3: Running Pascal version with test commands..."

# Create DOSBox config to run the game with input
cat > /tmp/dosbox-test.conf << 'EOF'
[autoexec]
mount d /app/src
d:
FORT1.EXE < test-commands.txt
exit
EOF

# Note: This won't work directly because FORT1.EXE expects interactive input
# We'll need a different approach

echo ""
echo "Note: Pascal version requires interactive execution in DOSBox."
echo "For now, running JavaScript version only..."
echo ""

echo "Step 4: Running JavaScript version..."
cd fort_web
node test-js-version.js test-commands.txt > js-output.txt 2>&1

echo ""
echo "JavaScript output saved to: fort_web/js-output.txt"
echo ""
echo "To compare with Pascal:"
echo "1. Run: docker run --rm -p 8080:8080 -v \$(pwd):/app/src/ davidmpaz/dosbox-tp7:1.1-amd64"
echo "2. Open browser to: http://localhost:8080"
echo "3. In DOSBox: D: then build.bat then FORT1.EXE"
echo "4. Execute commands from test-commands.txt manually"
echo "5. Compare outputs with fort_web/js-output.txt"
