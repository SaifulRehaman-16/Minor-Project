import { useMemo } from "react";

interface Activity {
  title: string;
  lat?: number;
  lng?: number;
  time?: string;
  type?: string;
}

interface GoogleItineraryMapProps {
  activities: Activity[];
  destination: string;
}

const GoogleItineraryMap = ({ activities, destination }: GoogleItineraryMapProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const mapUrl = useMemo(() => {
    const validActivities = activities.filter(a => a.title);
    if (validActivities.length === 0) {
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(destination)}`;
    }

    if (apiKey) {
      // Use the official Embed API with Waypoints
      const origin = encodeURIComponent(validActivities[0].title);
      const lastIdx = validActivities.length - 1;
      const destinationPoint = encodeURIComponent(validActivities[lastIdx].title);
      
      let waypoints = "";
      if (validActivities.length > 2) {
        waypoints = "&waypoints=" + validActivities
          .slice(1, lastIdx)
          .map(a => encodeURIComponent(a.title))
          .join("|");
      }

      return `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origin}&destination=${destinationPoint}${waypoints}`;
    } else {
      // Fallback for no API Key: Using the directions/route format
      // saddr = start address, daddr = destination address with +to: waypoints
      const origin = `${validActivities[0].title}, ${destination}`;
      const waypoints = validActivities
        .slice(1)
        .map(a => `${a.title}, ${destination}`)
        .join("+to:");
      
      return `https://maps.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(waypoints)}&output=embed&t=m&z=12`;
    }
  }, [activities, destination, apiKey]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-muted/20">
      <iframe
        title="Google Maps Itinerary"
        width="100%"
        height="100%"
        className="grayscale-[0.2] contrast-[1.1]"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
      />
      
      {!apiKey && (
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
          <div className="bg-background/80 backdrop-blur-md border border-white/10 rounded-lg p-2 text-[10px] text-muted-foreground text-center">
            Standard Google Maps view powered by search markers.
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleItineraryMap;
