#!/bin/bash

# Start React (frontend)
echo "Starting React app..."
# shellcheck disable=SC2164
cd frontend
npm run dev &  # Run React in background

# Go back to the root
# shellcheck disable=SC2103
cd ..

# Start PHP (backend) with server.php entry point
echo "Starting PHP server..."
# shellcheck disable=SC2164
cd backend
php -S 0.0.0.0:4000 -t . server.php &  # Run PHP server in background

# Start WebSocket server
# shellcheck disable=SC2164
cd core
echo "Starting WebSocket server..."
php WebSocketServer.php &  # Run WebSocket server in background

# Go back to the root
cd ..

# Optional: Connect to MySQL (commented out for safety)
# echo "Connecting to MySQL..."
# mysql -h app3306.maayn.me -u Falsopay -p"YOUR_PASSWORD"

# Wait for all background processes
wait
