#!/bin/bash

# Start React (frontend)
echo "Starting React app..."
cd frontend
npm run dev &  # Run React in background

# Go back to the root or backend directory
cd ..

# Start PHP (backend) with server.php entry point
echo "Starting PHP server..."
cd backend
php -S 0.0.0.0:4000 -t . server.php  # Specify server.php as the entry point

# Start WebSocket server
cd websockets
echo "Starting WebSocket server..."
php WebSocketServer.php &  # Run WebSocket server in background

# Go back to the root
cd ..

# Connect to MySQL
#echo "Connecting to MySQL..."
#mysql -h app3306.maayn.me -u Falsopay -p"YOUR_PASSWORD"  # Replace YOUR_PASSWORD with the actual password

# Wait for all processes to run
wait
