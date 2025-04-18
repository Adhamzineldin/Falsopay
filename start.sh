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

# Wait for both processes to run
wait
