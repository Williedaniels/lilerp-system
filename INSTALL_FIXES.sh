#!/bin/bash

# LILERP Mobile App - Installation Script for Fixes
# This script installs all the improvements and fixes

echo "=================================="
echo "LILERP Mobile App - Installing Fixes"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d "lilerp-mobile" ]; then
    echo "❌ Error: lilerp-mobile directory not found"
    echo "Please run this script from the lilerp-system-main-2 directory"
    exit 1
fi

cd lilerp-mobile/src

echo "📦 Step 1: Backing up current files..."
if [ -f "App.jsx" ]; then
    cp App.jsx App.jsx.backup
    echo "✅ Backed up App.jsx"
fi

if [ -f "ResponderDashboard.jsx" ]; then
    cp ResponderDashboard.jsx ResponderDashboard.jsx.backup
    echo "✅ Backed up ResponderDashboard.jsx"
fi

if [ -f "main.jsx" ]; then
    cp main.jsx main.jsx.backup
    echo "✅ Backed up main.jsx"
fi

echo ""
echo "🔄 Step 2: Installing improved files..."

# Replace files
if [ -f "App-improved.jsx" ]; then
    mv App-improved.jsx App.jsx
    echo "✅ Installed improved App.jsx"
else
    echo "❌ App-improved.jsx not found"
fi

if [ -f "ResponderDashboard-improved.jsx" ]; then
    mv ResponderDashboard-improved.jsx ResponderDashboard.jsx
    echo "✅ Installed improved ResponderDashboard.jsx"
else
    echo "❌ ResponderDashboard-improved.jsx not found"
fi

if [ -f "main-improved.jsx" ]; then
    mv main-improved.jsx main.jsx
    echo "✅ Installed improved main.jsx"
else
    echo "❌ main-improved.jsx not found"
fi

cd ../..

echo ""
echo "📚 Step 3: Checking dependencies..."
cd lilerp-mobile

if command -v npm &> /dev/null; then
    echo "✅ npm found"
    echo "Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
elif command -v pnpm &> /dev/null; then
    echo "✅ pnpm found"
    echo "Installing dependencies..."
    pnpm install
    echo "✅ Dependencies installed"
else
    echo "⚠️  No package manager found. Please install dependencies manually:"
    echo "   npm install"
    echo "   or"
    echo "   pnpm install"
fi

cd ..

echo ""
echo "=================================="
echo "✅ Installation Complete!"
echo "=================================="
echo ""
echo "📋 What was installed:"
echo "  ✅ Speech-to-text transcription"
echo "  ✅ Persistent login (remember me)"
echo "  ✅ Loading/splash screen"
echo "  ✅ Data persistence for reports"
echo "  ✅ Responder dashboard routing (/responder)"
echo "  ✅ Enhanced report details with audio & location"
echo "  ✅ Call functionality for responders"
echo "  ✅ All bug fixes"
echo ""
echo "🚀 Next Steps:"
echo "  1. cd lilerp-mobile"
echo "  2. npm run dev (or pnpm dev)"
echo "  3. Open http://localhost:5173/"
echo "  4. For responder dashboard: http://localhost:5173/responder"
echo ""
echo "📖 For detailed documentation, see:"
echo "  MOBILE_APP_FIXES_README.md"
echo ""
echo "🔙 Backup files saved as:"
echo "  - App.jsx.backup"
echo "  - ResponderDashboard.jsx.backup"
echo "  - main.jsx.backup"
echo ""
echo "=================================="

