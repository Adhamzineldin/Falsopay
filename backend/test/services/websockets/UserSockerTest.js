const userId = 1;
const socket = new WebSocket(`wss://app4100.maayn.me?userId=${userId}`);

socket.onopen = () => {
    console.log("Connected to WebSocket");
    socket.send("Hello from browser");
};

socket.onmessage = (event) => {
    socket.send("Received: " + event.data);
    console.log("Received:", event.data);
};

socket.onclose = () => {
    console.log("WebSocket closed");
};

socket.onerror = (err) => {
    console.error("WebSocket error:", err);
};
