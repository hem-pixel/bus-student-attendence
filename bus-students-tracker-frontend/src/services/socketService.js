/**
 * Socket.io Client Service
 * Manages WebSocket connection and bus tracking subscriptions
 */

import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const envUrl = 
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SOCKET_URL || import.meta.env?.VITE_API_URL)) ||
    'http://localhost:5000';
  // Strip trailing /api if present
  return envUrl.replace(/\/api\/?$/, '');
};

class SocketService {
  static socket = null;
  static listeners = new Map();

  static connect(busId = null) {
    if (!this.socket) {
      const serverUrl = getSocketUrl();
      this.socket = io(serverUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to GPS WebSocket server:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from GPS WebSocket:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.warn('⚠️ GPS WebSocket connection warning:', error.message);
      });
    }

    if (busId) {
      this.subscribeToBus(busId);
    }

    return this.socket;
  }

  static subscribeToBus(busId, callback = null) {
    if (!this.socket) this.connect();
    if (!busId) return;

    this.socket.emit('subscribe:bus', busId);

    if (callback) {
      const wrapped = (data) => {
        if (!data) return;
        // Verify matching busId if present
        if (data.busId && String(data.busId) !== String(busId) && data.location?.bus_id && String(data.location.bus_id) !== String(busId)) {
          return;
        }
        callback(data);
      };

      this.socket.on('location:updated', wrapped);
      this.socket.on('location:initial', wrapped);

      // Store callback for cleanup
      this.listeners.set(`bus:${busId}`, wrapped);
    }
  }

  static unsubscribeFromBus(busId) {
    if (this.socket && busId) {
      this.socket.emit('unsubscribe:bus', busId);
      const listener = this.listeners.get(`bus:${busId}`);
      if (listener) {
        this.socket.off('location:updated', listener);
        this.socket.off('location:initial', listener);
        this.listeners.delete(`bus:${busId}`);
      }
    }
  }

  static subscribeToFleet(callback) {
    if (!this.socket) this.connect();
    this.socket.emit('subscribe:admin');

    if (callback) {
      this.socket.on('fleet:location:updated', callback);
      this.socket.on('location:updated', callback);
    }
  }

  static unsubscribeFromFleet(callback) {
    if (this.socket && callback) {
      this.socket.off('fleet:location:updated', callback);
      this.socket.off('location:updated', callback);
    }
  }

  static sendDriverLocation(payload) {
    if (!this.socket) this.connect();
    this.socket.emit('driver:location:update', payload);
  }

  static emit(event, data) {
    if (!this.socket) this.connect();
    this.socket.emit(event, data);
  }

  static on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
  }

  static off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  static disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }
}

export default SocketService;
