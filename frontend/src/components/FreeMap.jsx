import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon (brand)
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#06b6d4" stroke="white" stroke-width="4"/>
      <path d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM20 25C17.24 25 15 22.76 15 20C15 17.24 17.24 15 20 15C22.76 15 25 17.24 25 20C25 22.76 22.76 25 20 25Z" fill="white"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const LoadingComponent = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
      <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
    </div>
  </div>
);

// Small control component to locate the user
function LocateControl({ onLocate }) {
  const map = useMap();

  const handleLocate = () => {
    if (!navigator.geolocation) {
      onLocate(null, new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];
        map.setView(latlng, Math.max(map.getZoom(), 13), { animate: true });
        onLocate(latlng, null);
      },
      (err) => {
        onLocate(null, err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="absolute top-3 right-3 z-50">
      <button
        type="button"
        onClick={handleLocate}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-md shadow-md hover:bg-white dark:hover:bg-gray-800 transition"
        title="Locate me"
      >
        <MapPin className="w-4 h-4 text-primary-500" />
        <span className="text-sm text-gray-700 dark:text-gray-200">Locate me</span>
      </button>
    </div>
  );
}

const FreeMap = ({ center, zoom = 15, markers = [], className = '', enableUserLocation = true }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [userPos, setUserPos] = React.useState(null);
  const [locError, setLocError] = React.useState(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLocate = (latlng, err) => {
    if (err) {
      setLocError(err.message || 'Unable to locate');
      return;
    }
    setLocError(null);
    setUserPos(latlng);
  };

  if (!isLoaded) return <LoadingComponent />;

  return (
    <div className={`w-full h-full relative ${className}`}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} className="rounded-lg">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position} icon={customIcon}>
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-1">{marker.title}</h3>
                {marker.description && <p className="text-sm text-gray-600">{marker.description}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {userPos && (
          <Marker position={userPos}>
            <Popup>
              <div className="text-center">
                <strong>You are here</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {enableUserLocation && <LocateControl onLocate={handleLocate} />}
      </MapContainer>

      {locError && (
        <div className="absolute bottom-3 left-3 z-50 p-2 bg-red-50 dark:bg-red-900/70 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-200">
          {locError}
        </div>
      )}
    </div>
  );
};

export default FreeMap;