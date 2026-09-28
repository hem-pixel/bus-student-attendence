/**
 * useSocket Hook: Real-time bus location subscription management
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import SocketService from '../services/socketService';

export function useSocket(busId) {
  const [location, setLocation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const prevBusIdRef = useRef(null);

  const handleLocationUpdate = useCallback((data) => {
    if (!data) return;
    const loc = data.location || data;
    if (loc && loc.latitude && loc.longitude) {
      setLocation(loc);
    }
  }, []);

  useEffect(() => {
    if (!busId) {
      setLocation(null);
      return;
    }

    // Connect & subscribe
    const socket = SocketService.connect();

    const updateStatus = () => {
      setIsConnected(Boolean(SocketService.socket?.connected));
    };

    updateStatus();

    socket.on('connect', updateStatus);
    socket.on('disconnect', updateStatus);

    SocketService.subscribeToBus(busId, handleLocationUpdate);
    prevBusIdRef.current = busId;

    const interval = setInterval(updateStatus, 3000);

    return () => {
      clearInterval(interval);
      socket.off('connect', updateStatus);
      socket.off('disconnect', updateStatus);
      if (prevBusIdRef.current) {
        SocketService.unsubscribeFromBus(prevBusIdRef.current);
      }
    };
  }, [busId, handleLocationUpdate]);

  return { location, isConnected };
}

export default useSocket;
