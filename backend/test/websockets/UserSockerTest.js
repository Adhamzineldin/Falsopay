const userId = 2
const socket = new WebSocket(`ws://localhost:8080?userId=${userId}`);

socket.onopen = () => {
    console.log("Connected to WebSocket");
    socket.send("Hello from browser");
};

socket.onmessage = (event) => {
    console.log("Received:", event.data);
};

socket.onclose = () => {
    console.log("WebSocket closed");
};

socket.onerror = (err) => {
    console.error("WebSocket error:", err);
};
