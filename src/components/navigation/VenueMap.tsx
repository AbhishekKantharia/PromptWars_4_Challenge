'use client';

import { useState, useCallback, useEffect } from 'react';
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

interface MapSection {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  density: number;
  capacity: number;
  occupancy: number;
}

const STADIUM_SECTIONS: MapSection[] = [
  { id: 'north-stand', name: 'North Stand', x: 140, y: 20, width: 320, height: 80, color: '#2563eb', density: 0.6, capacity: 15000, occupancy: 9000 },
  { id: 'south-stand', name: 'South Stand', x: 140, y: 300, width: 320, height: 80, color: '#2563eb', density: 0.75, capacity: 15000, occupancy: 11250 },
  { id: 'east-stand', name: 'East Stand', x: 460, y: 100, width: 80, height: 200, color: '#eab308', density: 0.85, capacity: 12000, occupancy: 10200 },
  { id: 'west-stand', name: 'West Stand', x: 60, y: 100, width: 80, height: 200, color: '#eab308', density: 0.9, capacity: 12000, occupancy: 10800 },
  { id: 'pitch', name: 'Playing Field', x: 140, y: 100, width: 320, height: 200, color: '#16a34a', density: 0, capacity: 0, occupancy: 0 },
  { id: 'vip-n', name: 'VIP Lounge (North)', x: 200, y: 30, width: 200, height: 50, color: '#9333ea', density: 0.95, capacity: 2000, occupancy: 1900 },
  { id: 'vip-s', name: 'VIP Lounge (South)', x: 200, y: 320, width: 200, height: 50, color: '#9333ea', density: 0.88, capacity: 2000, occupancy: 1760 },
  { id: 'food-court', name: 'Food Court', x: 460, y: 280, width: 80, height: 80, color: '#f97316', density: 0.7, capacity: 3000, occupancy: 2100 },
  { id: 'gate-n', name: 'North Gate', x: 270, y: 0, width: 60, height: 20, color: '#ef4444', density: 0.8, capacity: 4000, occupancy: 3200 },
  { id: 'gate-s', name: 'South Gate', x: 270, y: 380, width: 60, height: 20, color: '#ef4444', density: 0.65, capacity: 4000, occupancy: 2600 },
  { id: 'gate-e', name: 'East Gate', x: 540, y: 180, width: 20, height: 40, color: '#ef4444', density: 0.72, capacity: 3000, occupancy: 2160 },
  { id: 'gate-w', name: 'West Gate', x: 40, y: 180, width: 20, height: 40, color: '#ef4444', density: 0.58, capacity: 3000, occupancy: 1740 },
];

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

function getDensityColor(density: number): string {
  if (density > 0.85) return '#dc2626';
  if (density > 0.7) return '#f59e0b';
  if (density > 0.5) return '#f5c842';
  return '#22c55e';
}

export function VenueMap() {
  const { location } = useGeolocation();
  const { preferences } = useAccessibility();
  const [selectedDest, setSelectedDest] = useState('');
  const [customDest, setCustomDest] = useState('');
  const [route, setRoute] = useState<NavigationRoute | null>(null);
  const [alternatives, setAlternatives] = useState<{ name: string; distance: number; walkTime: number; accessible: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [sections, setSections] = useState(STADIUM_SECTIONS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSections(prev => prev.map(s => {
        if (s.id === 'pitch') return s;
        const variation = (Math.random() - 0.5) * 0.06;
        const newDensity = Math.max(0.1, Math.min(1, s.density + variation));
        const newOccupancy = Math.round(s.capacity * newDensity);
        return { ...s, density: newDensity, occupancy: newOccupancy, color: getDensityColor(newDensity) };
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
          <CardTitle className="flex items-center justify-between">
            <span>Interactive Stadium Map</span>
            <Badge variant="success" className="text-xs">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full rounded-xl overflow-hidden bg-fifa-navy border border-glass-border" role="img" aria-label="MetLife Stadium interactive map with live crowd density">
            <svg viewBox="0 0 600 400" className="w-full h-auto" aria-hidden="true">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <linearGradient id="pitch-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#15803d" />
                  <stop offset="100%" stopColor="#166534" />
                </linearGradient>
              </defs>

              <rect x="0" y="0" width="600" height="400" fill="#0a1628" rx="12"/>

              {sections.map((section) => {
                const isHovered = hoveredSection === section.id;
                const isSelected = selectedDest === section.id;
                const isPitch = section.id === 'pitch';

                return (
                  <g key={section.id}>
                    <rect
                      x={section.x}
                      y={section.y}
                      width={section.width}
                      height={section.height}
                      rx={isPitch ? 8 : 4}
                      fill={isPitch ? 'url(#pitch-gradient)' : section.color}
                      opacity={isHovered || isSelected ? 1 : 0.75}
                      stroke={isHovered ? '#ffffff' : isSelected ? '#f5c842' : 'transparent'}
                      strokeWidth={isHovered || isSelected ? 2 : 0}
                      filter={isHovered ? 'url(#glow)' : undefined}
                      className="transition-all duration-200"
                      style={{ cursor: isPitch ? 'default' : 'pointer' }}
                      onMouseEnter={() => !isPitch && setHoveredSection(section.id)}
                      onMouseLeave={() => setHoveredSection(null)}
                      onClick={() => !isPitch && handleNavigate(section.id)}
                    />
                    {section.width > 50 && section.height > 15 && (
                      <>
                        <text
                          x={section.x + section.width / 2}
                          y={section.y + section.height / 2 - (section.capacity > 0 ? 4 : 0)}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="white"
                          fontSize={section.capacity > 5000 ? 11 : 9}
                          fontWeight="600"
                          pointerEvents="none"
                        >
                          {section.name}
                        </text>
                        {section.capacity > 0 && (
                          <text
                            x={section.x + section.width / 2}
                            y={section.y + section.height / 2 + 12}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="rgba(255,255,255,0.7)"
                            fontSize="9"
                            pointerEvents="none"
                          >
                            {section.occupancy.toLocaleString()}/{section.capacity.toLocaleString()}
                          </text>
                        )}
                      </>
                    )}
                    {isPitch && (
                      <>
                        <line x1={section.x + section.width / 2} y1={section.y + 10} x2={section.x + section.width / 2} y2={section.y + section.height - 10} stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                        <circle cx={section.x + section.width / 2} cy={section.y + section.height / 2} r="30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
                      </>
                    )}
                  </g>
                );
              })}

              {hoveredSection && (
                <g>
                  {(() => {
                    const s = sections.find(sec => sec.id === hoveredSection);
                    if (!s || s.id === 'pitch') return null;
                    const tooltipX = Math.min(Math.max(s.x + s.width / 2, 80), 520);
                    const tooltipY = s.y > 200 ? s.y - 10 : s.y + s.height + 10;
                    return (
                      <>
                        <rect x={tooltipX - 70} y={tooltipY - 28} width={140} height={36} rx={6} fill="#1e293b" stroke="#334155" strokeWidth="1"/>
                        <text x={tooltipX} y={tooltipY - 14} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">{s.name}</text>
                        <text x={tooltipX} y={tooltipY + 2} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9">
                          {Math.round(s.density * 100)}% capacity ({s.occupancy.toLocaleString()}/{s.capacity.toLocaleString()})
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>

            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-fifa-dark/80 px-2 py-1 rounded-full border border-glass-border">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Low
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-fifa-dark/80 px-2 py-1 rounded-full border border-glass-border">
                <span className="w-2 h-2 rounded-full bg-yellow-500" /> Medium
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-fifa-dark/80 px-2 py-1 rounded-full border border-glass-border">
                <span className="w-2 h-2 rounded-full bg-red-500" /> High
              </span>
            </div>

            {location && (
              <div className="absolute top-3 right-3">
                <Badge variant="success">
                  📍 Live
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
              >
                <span className="text-xl" aria-hidden="true">{dest.icon}</span>
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
