#!/bin/bash

# TGDF Build Script
# Builds the Electron + React + TypeScript app for distribution

echo "🚀 Starting TGDF build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf release/

# Type check
echo "🔍 Running TypeScript type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript type check failed!"
    exit 1
fi

# Build the React app
echo "⚛️  Building React app..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ React build failed!"
    exit 1
fi

# Determine platform and build accordingly
PLATFORM=$(uname -s)
echo "🖥️  Detected platform: $PLATFORM"

case $PLATFORM in
    Darwin)
        echo "🍎 Building for macOS..."
        npm run dist-mac
        ;;
    Linux)
        echo "🐧 Building for Linux..."
        npm run dist-linux
        ;;
    MINGW*|CYGWIN*|MSYS*)
        echo "🪟 Building for Windows..."
        npm run dist-win
        ;;
    *)
        echo "❓ Unknown platform, building for all platforms..."
        npm run dist-all
        ;;
esac

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📦 Executables can be found in the 'release' directory"
    ls -la release/
else
    echo "❌ Build failed!"
    exit 1
fi
