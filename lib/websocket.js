// WebSocket client for real-time features
import { io } from 'socket.io-client';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
  }

  // Connect to WebSocket server
  connect(token) {
    if (this.socket && this.isConnected) {
      return;
    }

    const serverUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
    });

    this.setupEventListeners();
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('🔌 WebSocket error:', error);
    });
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join livestream room
  joinStream(streamId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_stream', streamId);
    }
  }

  // Leave livestream room
  leaveStream(streamId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_stream', streamId);
    }
  }

  // Send chat message in livestream
  sendStreamMessage(streamId, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stream_chat_message', {
        streamId,
        message
      });
    }
  }

  // Send product interaction in livestream
  sendProductInteraction(streamId, productId, action) {
    if (this.socket && this.isConnected) {
      this.socket.emit('stream_product_interaction', {
        streamId,
        productId,
        action
      });
    }
  }

  // Notify vendor is online
  notifyVendorOnline() {
    if (this.socket && this.isConnected) {
      this.socket.emit('vendor_online');
    }
  }

  // Send new order notification
  sendNewOrder(orderData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('new_order', orderData);
    }
  }

  // Send order status update
  sendOrderStatusUpdate(orderId, customerId, status) {
    if (this.socket && this.isConnected) {
      this.socket.emit('order_status_update', {
        orderId,
        customerId,
        status
      });
    }
  }

  // Event listeners for incoming events
  onStreamStats(callback) {
    if (this.socket) {
      this.socket.on('stream_stats', callback);
    }
  }

  onViewerJoined(callback) {
    if (this.socket) {
      this.socket.on('viewer_joined', callback);
    }
  }

  onViewerLeft(callback) {
    if (this.socket) {
      this.socket.on('viewer_left', callback);
    }
  }

  onStreamChatMessage(callback) {
    if (this.socket) {
      this.socket.on('stream_chat_message', callback);
    }
  }

  onProductInteraction(callback) {
    if (this.socket) {
      this.socket.on('product_interaction', callback);
    }
  }

  onNewOrderNotification(callback) {
    if (this.socket) {
      this.socket.on('new_order_notification', callback);
    }
  }

  onOrderStatusUpdated(callback) {
    if (this.socket) {
      this.socket.on('order_status_updated', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove event listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }
}

// Create and export WebSocket client instance
export const wsClient = new WebSocketClient();

// Hook for React components
export const useWebSocket = () => {
  return {
    connect: wsClient.connect.bind(wsClient),
    disconnect: wsClient.disconnect.bind(wsClient),
    joinStream: wsClient.joinStream.bind(wsClient),
    leaveStream: wsClient.leaveStream.bind(wsClient),
    sendStreamMessage: wsClient.sendStreamMessage.bind(wsClient),
    sendProductInteraction: wsClient.sendProductInteraction.bind(wsClient),
    notifyVendorOnline: wsClient.notifyVendorOnline.bind(wsClient),
    sendNewOrder: wsClient.sendNewOrder.bind(wsClient),
    sendOrderStatusUpdate: wsClient.sendOrderStatusUpdate.bind(wsClient),
    onStreamStats: wsClient.onStreamStats.bind(wsClient),
    onViewerJoined: wsClient.onViewerJoined.bind(wsClient),
    onViewerLeft: wsClient.onViewerLeft.bind(wsClient),
    onStreamChatMessage: wsClient.onStreamChatMessage.bind(wsClient),
    onProductInteraction: wsClient.onProductInteraction.bind(wsClient),
    onNewOrderNotification: wsClient.onNewOrderNotification.bind(wsClient),
    onOrderStatusUpdated: wsClient.onOrderStatusUpdated.bind(wsClient),
    onError: wsClient.onError.bind(wsClient),
    removeAllListeners: wsClient.removeAllListeners.bind(wsClient),
    getConnectionStatus: wsClient.getConnectionStatus.bind(wsClient),
  };
};
