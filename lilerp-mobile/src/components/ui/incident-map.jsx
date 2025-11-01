import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper function to format strings
const formatString = (str) => {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Custom icon for clustered reports
const createClusterIcon = (count) => {
  return L.divIcon({
    html: `<div class="relative flex items-center justify-center bg-red-500 text-white rounded-full w-8 h-8 font-bold text-sm border-2 border-white shadow-lg">${count}</div>`,
    className: '', // important to clear default styles
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to adjust map bounds to fit all markers
const MapBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 1) {
      const bounds = L.latLngBounds(points.map(p => [p.latitude, p.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else if (points && points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 13);
    }
  }, [points, map]);
  return null;
};

const IncidentMap = ({ incidents, latitude, longitude, location, reporterName }) => {
  // Handle multi-incident view for analytics page
  if (incidents && incidents.length > 0) {
    const defaultCenter = [6.2907, -10.7605]; // Monrovia
    
    return (
      <div className="w-full h-full rounded-lg overflow-hidden border-2 border-gray-200">
        <MapContainer
          center={defaultCenter}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {incidents.map((incident, index) => (
            <Marker
              key={index}
              position={[incident.latitude, incident.longitude]}
              icon={incident.count > 1 ? createClusterIcon(incident.count) : new L.Icon.Default()}
            >
              <Popup>
                <div className="text-sm max-w-xs">
                  {incident.count > 1 ? (
                    <>
                      <strong className="block mb-1">{incident.count} Reports at this location:</strong>
                      <ul className="list-disc list-inside">
                        {incident.reports.map(report => (
                          <li key={report.id}>{formatString(report.type || report.title)}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <strong>{formatString(incident.reports[0]?.type || incident.reports[0]?.title)}</strong>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          <MapBounds points={incidents} />
        </MapContainer>
      </div>
    );
  }

  // Handle single-incident view for detail modal
  const lat = latitude || 6.2907;
  const lng = longitude || -10.7605;

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        {/* ... existing single marker logic ... */}
      </MapContainer>
    </div>
  );
};

export default IncidentMap;