import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Activity {
  title: string;
  lat?: number;
  lng?: number;
  time?: string;
  type?: string;
}

interface ItineraryMapProps {
  activities: Activity[];
  destination: string;
  activeActivityIndex?: number;
}

// Component to handle map view updates
const MapController = ({ activities }: { activities: Activity[] }) => {
  const map = useMap();

  useEffect(() => {
    if (activities.length === 0) return;

    const bounds = L.latLngBounds(activities.filter(a => a.lat && a.lng).map(a => [a.lat!, a.lng!]));
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [activities, map]);

  return null;
};

const createNumberedIcon = (number: number) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold border-2 border-white shadow-lg">${number}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const ItineraryMap = ({ activities, destination }: ItineraryMapProps) => {
  const validActivities = activities.filter(a => a.lat && a.lng);
  
  // Default position if no activities have coordinates (center of a default city or 0,0)
  const defaultPosition: [number, number] = validActivities.length > 0 
    ? [validActivities[0].lat!, validActivities[0].lng!] 
    : [20, 0]; // World view

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
      <MapContainer 
        center={defaultPosition} 
        zoom={13} 
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController activities={validActivities} />
        
        {validActivities.map((activity, idx) => (
          <Marker 
            key={`${activity.title}-${idx}`} 
            position={[activity.lat!, activity.lng!]}
            icon={createNumberedIcon(idx + 1)}
          >
            <Popup className="custom-popup">
              <div className="p-1">
                <h3 className="font-bold text-sm mb-0.5">{activity.title}</h3>
                {activity.time && <p className="text-xs text-muted-foreground">{activity.time}</p>}
                {activity.type && (
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider">
                    {activity.type}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {!validActivities.length && (
         <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 text-center">
            <div className="bg-background/80 border border-white/10 rounded-xl p-4 max-w-xs shadow-2xl">
              <p className="text-sm font-medium text-foreground">Awaiting geo-coordinates from neural satellite...</p>
              <p className="text-xs text-muted-foreground mt-1">Try regenerating this day to see the interactive map.</p>
            </div>
         </div>
      )}
    </div>
  );
};

export default ItineraryMap;
