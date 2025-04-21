#!/bin/bash

# Start React (frontend)
echo "Starting React app..."
cd frontend
npm run dev &  # Run React in background

# Go back to the root
cd ..

# Start PHP (backend) with server.php entry point
echo "Starting PHP server..."
cd backend
php -S 0.0.0.0:4000 -t . server.php &  # Run PHP server in background

# Start WebSocket server
cd ../websockets
echo "Starting WebSocket server..."
php WebSocketServer.php &  # Run WebSocket server in background

# Go back to the root
cd ..

# Optional: Connect to MySQL (commented out for safety)
# echo "Connecting to MySQL..."
# mysql -h app3306.maayn.me -u Falsopay -p"YOUR_PASSWORD"

# Wait for all background processes
wait
