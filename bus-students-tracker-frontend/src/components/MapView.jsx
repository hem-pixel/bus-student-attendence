/**
 * MapView Component: High-performance Leaflet map for bus tracking
 * Supports single bus tracking with route trail and fleet-wide multi-bus view
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SVG Bus Icon for crisp rendering on all displays
const createBusIcon = (registration = '', isSelected = false) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="
          background: ${isSelected ? '#dc2626' : '#2563eb'};
          color: white;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          font-family: monospace;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.4);
          margin-bottom: 3px;
        ">
          🚌 ${registration || 'Bus'}
        </div>
        <div style="
          width: 28px;
          height: 28px;
          background: ${isSelected ? '#ef4444' : '#3b82f6'};
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 16px ${isSelected ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)'};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid ${isSelected ? '#ef4444' : '#3b82f6'};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42],
  });
};

export function MapView({
  locations = [],
  busInfo = null,
  fleet = null,
  selectedBusId = null,
  onSelectBus = null,
  centerLat = 10.7624,
  centerLng = 78.7624,
  zoom = 13,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const polylineLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // CartoDB Dark Matter / OpenStreetMap tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>')
        .addTo(map);

      // Feature groups
      polylineLayerRef.current = L.featureGroup().addTo(map);
      markersLayerRef.current = L.featureGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !polylineLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    polylineLayerRef.current.clearLayers();

    // Mode A: Fleet overview (multiple buses)
    if (fleet && Array.isArray(fleet) && fleet.length > 0) {
      const validPoints = [];

      fleet.forEach((bus) => {
        const lat = parseFloat(bus.latitude);
        const lng = parseFloat(bus.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        validPoints.push([lat, lng]);
        const isSelected = selectedBusId && String(selectedBusId) === String(bus.bus_id || bus.id);

        const marker = L.marker([lat, lng], {
          icon: createBusIcon(bus.registration_number || bus.bus_number, isSelected),
        });

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 170px; padding: 4px;">
            <div style="font-weight: 700; font-size: 14px; color: #1e293b; margin-bottom: 2px;">
              ${bus.registration_number || bus.bus_number || 'Bus'}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
              Route: <strong>${bus.route || 'Campus Route'}</strong>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
              <div>Speed: <strong>${bus.speed || 0} km/h</strong></div>
              <div>Status: <span style="color: ${bus.status === 'WORKING' ? '#16a34a' : '#ea580c'}; font-weight: 600;">${bus.status || 'ACTIVE'}</span></div>
            </div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 6px;">
              Updated: ${bus.updated_at ? new Date(bus.updated_at).toLocaleTimeString() : 'Live'}
            </div>
          </div>
        `);

        if (onSelectBus) {
          marker.on('click', () => onSelectBus(bus.bus_id || bus.id));
        }

        marker.addTo(markersLayerRef.current);
      });

      if (validPoints.length > 0) {
        try {
          const bounds = L.latLngBounds(validPoints);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
        } catch (e) {
          // ignore invalid bounds
        }
      }
      return;
    }

    // Mode B: Single Bus Tracking (with path trail)
    if (locations && Array.isArray(locations) && locations.length > 0) {
      const validPoints = locations
        .map((loc) => [parseFloat(loc.latitude), parseFloat(loc.longitude)])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

      if (validPoints.length === 0) return;

      // Draw route trail polyline
      if (validPoints.length > 1) {
        L.polyline(validPoints, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          lineJoin: 'round',
          dashArray: '2, 6',
        }).addTo(polylineLayerRef.current);

        // Solid accent on current segment
        L.polyline(validPoints.slice(-5), {
          color: '#ef4444',
          weight: 4,
          opacity: 0.9,
          lineCap: 'round',
        }).addTo(polylineLayerRef.current);
      }

      // Add Start point marker if history exists
      if (validPoints.length > 1) {
        L.circleMarker(validPoints[0], {
          radius: 6,
          fillColor: '#64748b',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.8,
        })
          .bindTooltip('Trip Start', { permanent: false, direction: 'top' })
          .addTo(markersLayerRef.current);
      }

      // Add current bus position
      const latest = locations[locations.length - 1];
      const currentPos = [parseFloat(latest.latitude), parseFloat(latest.longitude)];

      const currentMarker = L.marker(currentPos, {
        icon: createBusIcon(busInfo?.registration_number || busInfo?.bus_number || 'Bus', true),
      });

      currentMarker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; min-width: 180px; padding: 4px;">
          <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 2px;">
            ${busInfo?.registration_number || busInfo?.bus_number || 'Tracked Bus'}
          </div>
          <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
            ${busInfo?.route ? `Route: <strong>${busInfo.route}</strong>` : 'Live Telemetry'}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; background: #f1f5f9; padding: 6px; border-radius: 4px; border: 1px solid #cbd5e1;">
            <div>Speed: <strong>${latest.speed || 0} km/h</strong></div>
            <div>Accuracy: <strong>±${latest.accuracy || 10}m</strong></div>
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 6px;">
            Last Signal: ${latest.timestamp ? new Date(latest.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
          </div>
        </div>
      `);

      currentMarker.addTo(markersLayerRef.current);
      currentMarker.openPopup();

      // Pan to latest location
      map.panTo(currentPos, { animate: true });
    }
  }, [locations, fleet, busInfo, selectedBusId, onSelectBus]);

  return (
    <div className="relative w-full h-full min-h-[350px] overflow-hidden rounded-xl border border-gray-800 shadow-inner bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}

export default MapView;
