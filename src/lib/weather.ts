export interface WeatherData {
  temperature: string;
  condition: string;
  icon: string;
}

export const getWeatherIcon = (code: number): { condition: string; icon: string } => {
  switch (code) {
    case 0:
      return { condition: "Clear Sky", icon: "☀️" };
    case 1:
      return { condition: "Mainly Clear", icon: "🌤️" };
    case 2:
      return { condition: "Partly Cloudy", icon: "⛅" };
    case 3:
      return { condition: "Overcast", icon: "☁️" };
    case 45:
    case 48:
      return { condition: "Foggy", icon: "🌫️" };
    case 51:
    case 53:
    case 55:
      return { condition: "Drizzle", icon: "🌦️" };
    case 61:
    case 63:
    case 65:
      return { condition: "Rainy", icon: "🌧️" };
    case 71:
    case 73:
    case 75:
      return { condition: "Snow Fall", icon: "❄️" };
    case 77:
      return { condition: "Snow Grains", icon: "❄️" };
    case 80:
    case 81:
    case 82:
      return { condition: "Rain Showers", icon: "🌦️" };
    case 85:
    case 86:
      return { condition: "Snow Showers", icon: "❄️" };
    case 95:
      return { condition: "Thunderstorm", icon: "⛈️" };
    case 96:
    case 99:
      return { condition: "Thunderstorm with Hail", icon: "⛈️" };
    default:
      return { condition: "Clear Sky", icon: "☀️" };
  }
};

export const geocodeDestination = async (query: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
};

export const fetchWeather = async (lat: number, lng: number): Promise<WeatherData[] | null> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max&timezone=auto`
    );
    const data = await response.json();
    
    if (data && data.daily) {
      return data.daily.time.map((time: string, index: number) => {
        const { condition, icon } = getWeatherIcon(data.daily.weathercode[index]);
        return {
          temperature: `${Math.round(data.daily.temperature_2m_max[index])}°C`,
          condition,
          icon,
        };
      });
    }
  } catch (error) {
    console.error("Weather fetch error:", error);
  }
  return null;
};
