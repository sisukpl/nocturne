#!/bin/zsh

# Change directory to the app folder where this script is located
cd "$(dirname "$0")"

# Ensure Node.js is in PATH
export PATH="/Users/Siddharth/.nodejs/bin:$PATH"

echo "=========================================================="
echo "   🌌 Starting Aurora & Dark-Sky Planner..."
echo "=========================================================="
echo ""

# Open default browser after 1 second
(sleep 1.2 && open "http://localhost:5173/") &

# Start Vite server
npm run dev -- --host --port 5173
