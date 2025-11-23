#!/bin/bash

echo "🔄 Restarting CORELIA Application..."

# Kill existing processes
echo "🛑 Stopping existing servers..."
pkill -9 -f "uvicorn app.main:app"
pkill -9 -f "vite"
sleep 2

# Start Backend
echo "🚀 Starting Backend..."
cd /Users/riishabhjain/Desktop/HACK_HATCH_FS/HackHatch-Corelia/backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 3

# Start Frontend
echo "🚀 Starting Frontend..."
cd /Users/riishabhjain/Desktop/HACK_HATCH_FS/HackHatch-Corelia/frontend
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

echo "✅ Servers Started!"
echo "   Backend PID: $BACKEND_PID (port 8000)"
echo "   Frontend PID: $FRONTEND_PID (port 3000)"
echo ""
echo "📊 Check logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🌐 Access at: http://localhost:3000"
