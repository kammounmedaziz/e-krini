import React from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { MapPin, Loader2 } from 'lucide-react';

const MapComponent = ({ center, zoom, markers = [] }) => {
  const ref = React.useRef();

  React.useEffect(() => {
    if (ref.current && window.google) {
      const map = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ weight: '2.00' }],
          },
          {
            featureType: 'all',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#9c9c9c' }],
          },
          {
            featureType: 'all',
            elementType: 'labels.text',
            stylers: [{ visibility: 'on' }],
          },
          {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [{ color: '#f2f2f2' }],
          },
          {
            featureType: 'landscape',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'landscape.man_made',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'poi',
            elementType: 'all',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'road',
            elementType: 'all',
            stylers: [{ saturation: -100 }, { lightness: 45 }],
          },
          {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [{ color: '#eeeeee' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#7b7b7b' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#ffffff' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'all',
            stylers: [{ visibility: 'simplified' }],
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'transit',
            elementType: 'all',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'water',
            elementType: 'all',
            stylers: [{ color: '#46bcec' }, { visibility: 'on' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#c8d7d4' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#070707' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#ffffff' }],
          },
        ],
      });

      // Add markers
      markers.forEach((markerData) => {
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#06b6d4" stroke="white" stroke-width="4"/>
                <path d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM20 25C17.24 25 15 22.76 15 20C15 17.24 17.24 15 20 15C22.76 15 25 17.24 25 20C25 22.76 22.76 25 20 25Z" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 40),
          },
        });

        // Add info window if description exists
        if (markerData.description) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="max-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #06b6d4;">${markerData.title}</h3>
                <p style="margin: 0; color: #666;">${markerData.description}</p>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        }
      });
    }
  }, [center, zoom, markers]);

  return <div ref={ref} className="w-full h-full rounded-lg" />;
};

const LoadingComponent = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-2" />
      <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
    </div>
  </div>
);

const ErrorComponent = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
    <div className="text-center">
      <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400 mb-2">Failed to load map</p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        Please check your Google Maps API key
      </p>
    </div>
  </div>
);

const Map = ({ center, zoom = 15, markers = [], className = '' }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  if (!apiKey || apiKey === 'your-google-maps-api-key-here') {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="text-center">
          <MapPin className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">Map API Key Required</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Please add your Google Maps API key to the .env file
          </p>
          <code className="block mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs">
            VITE_GOOGLE_MAPS_KEY=your-api-key-here
          </code>
        </div>
      </div>
    );
  }

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return <LoadingComponent />;
      case Status.FAILURE:
        return <ErrorComponent />;
      case Status.SUCCESS:
        return <MapComponent center={center} zoom={zoom} markers={markers} />;
    }
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <Wrapper apiKey={apiKey} render={render} />
    </div>
  );
};

export default Map;