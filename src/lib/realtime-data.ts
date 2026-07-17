const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  uvIndex: number;
  precipitation: number;
  visibility: number;
  timestamp: number;
}

export interface VenueLocation {
  id: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
  capacity: number;
}

export const VENUES: VenueLocation[] = [
  { id: 'metlife', name: 'MetLife Stadium', city: 'East Rutherford, NJ', lat: 40.8128, lon: -74.0742, capacity: 82500 },
  { id: 'sofi', name: 'SoFi Stadium', city: 'Inglewood, CA', lat: 33.9535, lon: -118.3392, capacity: 70240 },
  { id: 'atte', name: 'AT&T Stadium', city: 'Arlington, TX', lat: 32.7473, lon: -97.0945, capacity: 80000 },
  { id: 'arrowhead', name: 'Arrowhead Stadium', city: 'Kansas City, MO', lat: 39.0489, lon: -94.4839, capacity: 76416 },
  { id: 'nrg', name: 'NRG Stadium', city: 'Houston, TX', lat: 29.6847, lon: -95.4107, capacity: 72220 },
  { id: 'hardrock', name: 'Hard Rock Stadium', city: 'Miami Gardens, FL', lat: 25.958, lon: -80.2389, capacity: 64767 },
  { id: 'lumen', name: 'Lumen Field', city: 'Seattle, WA', lat: 47.5952, lon: -122.3316, capacity: 68740 },
  { id: 'levi', name: "Levi's Stadium", city: 'Santa Clara, CA', lat: 37.4033, lon: -121.9694, capacity: 68500 },
  { id: 'gillette', name: 'Gillette Stadium', city: 'Foxborough, MA', lat: 42.0909, lon: -71.2643, capacity: 65878 },
  { id: 'lincoln', name: 'Lincoln Financial Field', city: 'Philadelphia, PA', lat: 39.9008, lon: -75.1675, capacity: 69176 },
  { id: 'bmo', name: 'BMO Field', city: 'Toronto, ON', lat: 43.6332, lon: -79.4186, capacity: 30000 },
  { id: 'estadio-azteca', name: 'Estadio Azteca', city: 'Mexico City', lat: 19.3029, lon: -99.1505, capacity: 87000 },
  { id: 'estadio-bbva', name: 'Estadio BBVA', city: 'Monterrey', lat: 25.67, lon: -100.244, capacity: 53500 },
  { id: 'mercedes-benz', name: 'Mercedes-Benz Stadium', city: 'Atlanta, GA', lat: 33.7554, lon: -84.401, capacity: 71000 },
  { id: 'bc-place', name: 'BC Place', city: 'Vancouver, BC', lat: 49.2768, lon: -123.1107, capacity: 54500 },
];

const WMO_CODES: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Depositing rime fog',
  51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
  61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
  80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
  85: 'Slight snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = `${OPEN_METEO_BASE}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,visibility&daily=uv_index_max&timezone=auto&forecast_days=1`;
  const res = await fetch(url, {     next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
  const data = await res.json();
  const current = data.current;
  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
    condition: WMO_CODES[current.weather_code] || 'Unknown',
    uvIndex: data.daily?.uv_index_max?.[0] || 0,
    precipitation: current.precipitation || 0,
    visibility: current.visibility || 10000,
    timestamp: Date.now(),
  };
}

export async function fetchNearbyPlaces(lat: number, lon: number, category: string, radius = 1000): Promise<{ name: string; lat: number; lon: number; distance: number; type: string }[]> {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="${category}"](around:${radius},${lat},${lon});
      way["amenity"="${category}"](around:${radius},${lat},${lon});
    );
    out center 20;
  `;
  const res = await fetch(OVERPASS_API, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    next: { revalidate: 600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.elements || []).map((el: Record<string, unknown>) => {
    const elLat = (el.lat as number) || ((el.center as { lat: number })?.lat);
    const elLon = (el.lon as number) || ((el.center as { lon: number })?.lon);
    const tags = (el.tags || {}) as Record<string, string>;
    return {
      name: tags.name || tags['name:en'] || category,
      lat: elLat,
      lon: elLon,
      distance: haversineMeters(lat, lon, elLat, elLon),
      type: tags.amenity || category,
    };
  }).filter((p: { lat: number; lon: number }) => p.lat && p.lon).sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance);
}

export async function fetchTransitStops(lat: number, lon: number, radius = 2000): Promise<{ name: string; lat: number; lon: number; distance: number; operator?: string }[]> {
  const query = `
    [out:json][timeout:10];
    (
      node["public_transport"="stop_position"](around:${radius},${lat},${lon});
      node["public_transport"="platform"](around:${radius},${lat},${lon});
      node["railway"="station"](around:${radius},${lat},${lon});
    );
    out 30;
  `;
  const res = await fetch(OVERPASS_API, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    next: { revalidate: 600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.elements || []).map((el: Record<string, unknown>) => {
    const tags = (el.tags || {}) as Record<string, string>;
    return {
      name: tags.name || tags['name:en'] || 'Transit Stop',
      lat: el.lat as number,
      lon: el.lon as number,
      distance: haversineMeters(lat, lon, el.lat as number, el.lon as number),
      operator: tags.operator || undefined,
    };
  }).filter((s: { lat: number; lon: number }) => s.lat && s.lon).sort((a: { distance: number }, b: { distance: number }) => a.distance - b.distance);
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const res = await fetch(`${NOMINATIM_API}/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18`, {
    headers: { 'User-Agent': 'StadiumIQ/1.0' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return 'Unknown location';
  const data = await res.json();
  return data.display_name || 'Unknown location';
}

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateWalkTime(distanceMeters: number): number {
  return Math.round((distanceMeters / 1.4) + 30);
}

export function getVenueById(id: string): VenueLocation | undefined {
  return VENUES.find(v => v.id === id);
}

export function getWeatherImpact(weather: WeatherData): { crowdImpact: string; transportImpact: string; safetyNotes: string[] } {
  const notes: string[] = [];
  let crowdImpact = 'Normal';
  let transportImpact = 'Normal';

  if (weather.temperature > 35) {
    crowdImpact = 'Fans may stay indoors longer';
    transportImpact = 'Expect increased ride-share demand';
    notes.push('Heat advisory: Stay hydrated, seek shade');
  } else if (weather.temperature < 0) {
    crowdImpact = 'Fans arriving later due to cold';
    transportImpact = 'Roads may be slippery';
    notes.push('Cold weather: Dress warmly');
  }

  if (weather.precipitation > 5) {
    crowdImpact = 'Reduced outdoor movement';
    transportImpact = 'Traffic delays expected';
    notes.push('Rain: Bring umbrella, allow extra travel time');
  }

  if (weather.windSpeed > 40) {
    transportImpact = 'High wind warning for elevated areas';
    notes.push('High winds: Be cautious near structures');
  }

  if (weather.weatherCode >= 95) {
    crowdImpact = 'Emergency shelter protocols active';
    transportImpact = 'Transit may be suspended';
    notes.push('Thunderstorm: Seek shelter immediately');
  }

  if (weather.uvIndex > 8) {
    notes.push('Very high UV: Use sunscreen, wear hat');
  }

  return { crowdImpact, transportImpact, safetyNotes: notes };
}
