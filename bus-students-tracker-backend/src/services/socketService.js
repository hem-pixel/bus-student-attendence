/**
 * WebSocket Service: Real-time location broadcast
 */

const GPSService = require('./gpsService');

class SocketService {
  static io = null;

  static initialize(io) {
    this.io = io;

    io.on('connection', (socket) => {
      console.log(`✅ Client connected to WebSocket: ${socket.id}`);

      // Join room for bus tracking
      socket.on('subscribe:bus', async (busId) => {
        if (!busId) return;
        const roomName = `bus:${busId}`;
        socket.join(roomName);
        console.log(`📍 Socket ${socket.id} subscribed to ${roomName}`);

        // Send last known location
        await this.sendLastLocation(busId, socket);
      });

      // Leave room
      socket.on('unsubscribe:bus', (busId) => {
        if (!busId) return;
        const roomName = `bus:${busId}`;
        socket.leave(roomName);
        console.log(`🚫 Socket ${socket.id} unsubscribed from ${roomName}`);
      });

      // Join admin tracking room
      socket.on('subscribe:admin', () => {
        socket.join('admins');
        console.log(`👑 Socket ${socket.id} subscribed to admins fleet channel`);
      });

      // Receive GPS update from driver or in-charge app
      socket.on('driver:location:update', async (data) => {
        try {
          const { busId, bus_id, lat, lng, latitude, longitude, speed, bearing, accuracy, altitude, deviceInfo, device_info } = data || {};
          const targetBusId = busId || bus_id;
          const targetLat = lat !== undefined ? lat : latitude;
          const targetLng = lng !== undefined ? lng : longitude;

          // Validate
          if (!targetBusId) {
            socket.emit('error', { message: 'Missing busId' });
            return;
          }

          // Save to database
          const location = await GPSService.saveLocation(targetBusId, {
            lat: targetLat,
            lng: targetLng,
            speed,
            bearing,
            accuracy,
            altitude,
            deviceInfo: deviceInfo || device_info,
          });

          // Broadcast to all subscribers of this bus
          this.io.to(`bus:${targetBusId}`).emit('location:updated', {
            busId: targetBusId,
            location,
            timestamp: new Date().toISOString(),
          });

          // Also broadcast to admin fleet dashboard
          this.io.to('admins').emit('fleet:location:updated', {
            busId: targetBusId,
            location,
            timestamp: new Date().toISOString(),
          });

          console.log(`📍 Location updated for bus ${targetBusId}: [${targetLat}, ${targetLng}]`);
        } catch (err) {
          console.error('❌ Error processing location update:', err.message);
          socket.emit('error', { message: 'Failed to update location', error: err.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Send last known location to new subscriber
   */
  static async sendLastLocation(busId, socket) {
    try {
      const location = await GPSService.getLatestLocation(busId);
      if (location) {
        socket.emit('location:initial', { busId, location });
        socket.emit('location:updated', { busId, location, timestamp: location.updated_at || location.timestamp });
      }
    } catch (err) {
      console.error('❌ Error sending last location:', err.message);
    }
  }

  /**
   * Broadcast location to all admin users
   */
  static broadcastToAdmins(event, data) {
    if (this.io) {
      this.io.to('admins').emit(event, data);
    }
  }

  /**
   * Broadcast location to all in-charges of a specific bus
   */
  static broadcastToIncharges(busId, event, data) {
    if (this.io) {
      this.io.to(`incharge:${busId}`).emit(event, data);
      this.io.to(`bus:${busId}`).emit(event, data);
    }
  }

  /**
   * Broadcast location update for a bus
   */
  static broadcastBusLocation(busId, location) {
    if (this.io) {
      this.io.to(`bus:${busId}`).emit('location:updated', {
        busId,
        location,
        timestamp: new Date().toISOString(),
      });
      this.io.to('admins').emit('fleet:location:updated', {
        busId,
        location,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = SocketService;
