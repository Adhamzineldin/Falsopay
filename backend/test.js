// Import required packages
const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = 3000;

// Use CORS to allow cross-origin requests
app.use(cors());

// Create MySQL connection pool using environment variables
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Utility function to check DB status
function checkDatabaseStatus() {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        dbPool.query('SELECT 1', (err, results) => {
            const responseTime = Date.now() - startTime;
            if (err) {
                reject({
                    status: 'error',
                    message: 'Database is down or unreachable.',
                    response_time: 'N/A'
                });
            } else {
                resolve({
                    status: 'operational',
                    message: 'Database is responsive.',
                    response_time: `${responseTime}ms`
                });
            }
        });
    });
}

// Utility function to check WebSocket status (using a socket connection test)
function checkWebSocketStatus() {
    const wsHost = 'localhost'; // Change as needed
    const wsPort = 4100; // Change as needed
    const startTime = Date.now();
    const socket = require('net').createConnection(wsPort, wsHost, () => {
        const responseTime = Date.now() - startTime;
        socket.end();
        return {
            status: 'operational',
            message: 'WebSocket is reachable.',
            response_time: `${responseTime}ms`
        };
    });

    socket.on('error', () => {
        return {
            status: 'error',
            message: 'WebSocket is down.',
            response_time: 'N/A'
        };
    });
}

// Serve the status page HTML
app.get('/', async (req, res) => {
    try {
        const dbStatus = await checkDatabaseStatus();
       

        // Load HTML content
        const htmlContent = await new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, 'public/index.html'), 'utf-8', (err, data) => {
                if (err) {
                    console.error("Error loading HTML file:", err);
                    reject(err);  // Reject the promise if reading the file fails
                } else {
                    resolve(data);
                }
            });
        });

        // Replace status placeholders in the HTML content
        const updatedHtml = htmlContent
            .replace('id="db-status" class="status-icon operational"', `id="db-status" class="status-icon ${dbStatus.status}"`)
            .replace('id="db-label" class="status-label operational">Operational<', `id="db-label" class="status-label ${dbStatus.status}">${dbStatus.message}<`)
            .replace('Response time: 56ms', `Response time: ${dbStatus.response_time}`)
            .replace('id="websocket-status" class="status-icon operational"', `id="websocket-status" class="status-icon ${"operational"}"`)
            .replace('id="websocket-label" class="status-label operational">Operational<', `id="websocket-label" class="status-label ${"operational"}">${"good"}<`)
            .replace('Response time: 42ms', `Response time: ${0}`)
            .replace('<span id="last-updated">Just now</span>', `<span id="last-updated">${new Date().toLocaleString()}</span>`);

        res.send(updatedHtml);
    } catch (error) {
        console.error("Error occurred in handling request:", error);
        res.status(500).send(`Error loading page: ${error.message}`);
    }
});

// API endpoint to get system status in JSON format
app.get('/api/admin/system/status', async (req, res) => {
    try {
        const dbStatus = await checkDatabaseStatus();
        const wsStatus = checkWebSocketStatus();

        res.json({
            status: 'success',
            code: 200,
            data: {
                database: dbStatus,
                websocket: wsStatus,
                timestamp: new Date().toISOString(),
                server: {
                    status: 'operational',
                    label: 'Operational',
                    message: 'API server is running normally',
                    memory_usage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
                }
            }
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to retrieve status' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
