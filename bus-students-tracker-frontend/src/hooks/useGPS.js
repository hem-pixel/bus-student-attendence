/**
 * useGPS Hook: Collect GPS coordinates from browser Geolocation API
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function useGPS(enabled = false) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef(null);

  const checkPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return false;
    }

    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state === 'granted' || permission.state === 'prompt';
      }
      return true;
    } catch {
      return true;
    }
  }, []);

  const startTracking = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation not supported');
      return null;
    }

    setIsTracking(true);
    setError(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading, altitude } = position.coords;
        const timestamp = position.timestamp || Date.now();

        setLocation({
          lat: latitude,
          lng: longitude,
          latitude,
          longitude,
          accuracy: accuracy ? parseFloat(accuracy.toFixed(1)) : 10,
          speed: speed ? parseFloat((speed * 3.6).toFixed(1)) : 0, // m/s to km/h
          bearing: heading || 0,
          altitude: altitude ? parseFloat(altitude.toFixed(1)) : 0,
          timestamp: new Date(timestamp).toISOString(),
        });
        setError(null);
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
        setError(err.message || 'Unable to retrieve location');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    watchIdRef.current = watchId;
    return watchId;
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    if (enabled) {
      checkPermission().then((permitted) => {
        if (permitted) {
          startTracking();
        } else {
          setError('Location permission denied');
        }
      });
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [enabled, checkPermission, startTracking, stopTracking]);

  return { 
    location, 
    error, 
    isTracking, 
    startTracking, 
    stopTracking, 
    checkPermission 
  };
}

export default useGPS;
