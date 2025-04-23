
import { toast } from '@/components/ui/sonner';

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private userId: string | null = null;

  constructor() {
    this.listeners = new Map();
  }

  connect(userId: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.close();
    }

    this.userId = userId;
    // Ensure userId is included in the websocket connection URL
    const wsUrl = `${import.meta.env.VITE_WS_URL}?userID=${userId}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected for user:', userId);
      this.reconnectAttempts = 0;
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle notification messages
        if (data.type === 'notification') {
          // Display notification using toast
          toast(data.title, {
            description: data.message,
          });
        }
        
        // Notify all listeners for this event type
        const eventListeners = this.listeners.get(data.type) || [];
        eventListeners.forEach(listener => listener(data));
        
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.socket.onclose = (event) => {
      if (!event.wasClean) {
        console.log('WebSocket connection closed unexpectedly. Attempting to reconnect...');
        this.attemptReconnect();
      } else {
        console.log('WebSocket connection closed cleanly');
      }
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect(this.userId!);
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.userId = null;
    }
  }
  
  subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(callback);
    
    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(eventType) || [];
      const index = eventListeners.indexOf(callback);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    };
  }
  
  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket not connected');
    }
  }
}

// Export as singleton
export default new WebSocketService();
