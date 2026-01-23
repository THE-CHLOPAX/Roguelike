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

# Generate app icons
echo "🎨 Generating app icons..."
npm run build-icons
if [ $? -ne 0 ]; then
    echo "❌ Icon generation failed!"
    exit 1
fi

# Type check
echo "🔍 Running TypeScript type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript type check failed!"
    exit 1
fi

# Compile main process TypeScript
echo "🔧 Compiling main process..."
npx tsc -p tsconfig.main.json
if [ $? -ne 0 ]; then
    echo "❌ Main process compilation failed!"
    exit 1
fi

# Build the React app
echo "⚛️  Building React app..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ React build failed!"
    exit 1
fi

# Copy assets to dist folder
echo "📦 Copying assets..."
npm run copy-assets
if [ $? -ne 0 ]; then
    echo "❌ Asset copy failed!"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📦 Build artifacts can be found in the 'dist' directory"
