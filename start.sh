#!/bin/bash

# Exit script on any error
set -e

# Store all background process PIDs
PIDS=()

# Cleanup function on Ctrl+C or exit
cleanup() {
  echo "Shutting down servers..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Start React (frontend)
echo "Starting React app..."
cd frontend || exit
npm run dev &  # Run in background
PIDS+=($!)
cd ..

# Start PHP (backend)
echo "Starting PHP server..."
cd backend || exit
php -S 0.0.0.0:4000 -t . server.php &  # Run in background
PIDS+=($!)
cd ..

# Start WebSocket server
echo "Starting WebSocket server..."
cd backend/core || exit
php WebSocketServer.php &  # Run in background
PIDS+=($!)
cd ..

# Wait for all background processes
wait
