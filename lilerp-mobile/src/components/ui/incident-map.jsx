import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const IncidentMap = ({ latitude, longitude, location, reporterName }) => {
  // Default to Monrovia if no coordinates
  const lat = latitude || 6.2907;
  const lng = longitude || -10.7605;

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="text-sm">
              <strong>{reporterName || 'Incident Location'}</strong>
              <br />
              {location || 'Location not specified'}
              <br />
              <span className="text-xs text-gray-500">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default IncidentMap;