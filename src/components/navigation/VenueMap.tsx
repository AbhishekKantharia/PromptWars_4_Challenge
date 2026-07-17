'use client';

import { useState, useCallback } from 'react';
import { apiUrl } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import type { NavigationRoute } from '@/types/navigation';

interface RouteInstruction {
  step: number;
  text: string;
}

const DESTINATIONS = [
  { id: 'gate', label: 'Gate', icon: '🚪' },
  { id: 'restroom', label: 'Restroom', icon: '🚻' },
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'atm', label: 'ATM', icon: '🏧' },
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'charging', label: 'Charging', icon: '🔌' },
  { id: 'lost_found', label: 'Lost & Found', icon: '📦' },
  { id: 'wheelchair', label: 'Accessible', icon: '♿' },
];

export function VenueMap() {
  const { location } = useGeolocation();
  const { preferences } = useAccessibility();
  const [selectedDest, setSelectedDest] = useState('');
  const [customDest, setCustomDest] = useState('');
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [alternatives, setAlternatives] = useState<{ name: string; distance: number; walkTime: number; accessible: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleNavigate = useCallback(async (destination: string) => {
    if (!destination) return;
    setLoading(true);
    setSelectedDest(destination);

    try {
      const params = new URLSearchParams({
        latitude: String(location?.latitude ?? 40.8128),
        longitude: String(location?.longitude ?? -74.0745),
        destination,
        accessible: String(preferences.wheelchairUser),
        crowdAware: 'true',
      });

      const res = await fetch(apiUrl(`/api/navigation?${params}`));
      const data = await res.json();

      if (data.route) {
        setRoute(data.route);
        setAlternatives(data.alternatives || []);
      }
    } catch (err) {
      console.error('Navigation error:', err);
    } finally {
      setLoading(false);
    }
  }, [location, preferences.wheelchairUser]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Interactive Stadium Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-fifa-navy border border-glass-border" role="img" aria-label="MetLife Stadium interactive map">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-6xl" aria-hidden="true">🏟️</div>
                <p className="text-fifa-gray text-sm">MetLife Stadium — Interactive Map</p>
                <p className="text-fifa-gray text-xs">Google Maps integration</p>
              </div>
            </div>

            {location && (
              <div className="absolute bottom-3 left-3">
                <Badge variant="success">
                  📍 Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Where do you want to go?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.id}
                onClick={() => handleNavigate(dest.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-sm transition-all ${
                  selectedDest === dest.id
                    ? 'border-fifa-accent bg-fifa-accent/10 text-fifa-accent'
                    : 'border-glass-border bg-white/5 text-fifa-silver hover:border-fifa-accent/30'
                }`}
                aria-pressed={selectedDest === dest.id}
                role="button"
              >
                <span className="text-xl" role="img" aria-hidden="true">{dest.icon}</span>
                <span>{dest.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={customDest}
              onChange={(e) => setCustomDest(e.target.value)}
              placeholder="Or type a destination..."
              aria-label="Custom destination"
              onKeyDown={(e) => { if (e.key === 'Enter') handleNavigate(customDest); }}
            />
            <Button variant="gold" onClick={() => handleNavigate(customDest)} disabled={!customDest}>
              Go
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-3 text-fifa-gray">Finding the best route...</span>
          </CardContent>
        </Card>
      )}

      {route && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Route to {route.destination?.name || selectedDest}
              {route.accessible && <Badge variant="success">♿ Accessible</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4 text-sm">
              <div><span className="text-fifa-gray">Distance:</span> <span className="text-fifa-white font-semibold">{route.distance}m</span></div>
              <div><span className="text-fifa-gray">Walk time:</span> <span className="text-fifa-white font-semibold">~{Math.round(route.estimatedTime / 60)} min</span></div>
            </div>
            {route.instructions && (
              <ol className="space-y-2">
                {(route.instructions as unknown as RouteInstruction[]).map((inst) => (
                  <li key={inst.step} className="flex items-start gap-3 text-sm">
                    <span className="h-6 w-6 rounded-full bg-fifa-accent/20 text-fifa-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {inst.step}
                    </span>
                    <span className="text-fifa-silver">{inst.text}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      )}

      {alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alternative Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alternatives.map((alt, i) => (
                <button
                  key={i}
                  onClick={() => handleNavigate(alt.name.toLowerCase().split(' ')[0])}
                  className="w-full flex items-center justify-between rounded-xl border border-glass-border bg-white/5 px-4 py-3 text-left hover:border-fifa-accent/30 transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-fifa-white">{alt.name}</p>
                    <p className="text-xs text-fifa-gray">{alt.distance}m · ~{Math.round(alt.walkTime / 60)} min walk</p>
                  </div>
                  {alt.accessible && <Badge variant="success">♿</Badge>}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
