#!/bin/bash

# AutoEnroll.ie Startup Script
# This script starts both the API and Web servers

echo "🚀 Starting AutoEnroll.ie..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo ""
fi

# Build the packages
echo "🔨 Building packages..."
npm run build
echo ""

# Start API server in background
echo "🔧 Starting API server on port 4000..."
npm run dev &
API_PID=$!
echo "   API PID: $API_PID"

# Wait for API to be ready
echo "   Waiting for API to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "   ✅ API is ready!"
    break
  fi
  sleep 1
  if [ $i -eq 30 ]; then
    echo "   ⚠️  API might not be ready yet, continuing anyway..."
  fi
done

echo ""
echo "🌐 Starting Web server on port 3000..."
cd apps/web
npm run dev &
WEB_PID=$!
echo "   Web PID: $WEB_PID"
cd ../..

echo ""
echo "✅ Both servers started!"
echo ""
echo "📝 Access the application:"
echo "   - Web Interface: http://localhost:3000"
echo "   - API Server: http://localhost:4000"
echo ""
echo "   If running in Codespaces, use the forwarded URLs shown in the Ports panel"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $API_PID $WEB_PID
