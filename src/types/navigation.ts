export interface NavigationRoute {
  id: string;
  origin: VenuePoint;
  destination: VenuePoint;
  waypoints: VenuePoint[];
  distance: number;
  estimatedTime: number;
  accessible: boolean;
  crowdAware: boolean;
  instructions: NavigationInstruction[];
  polyline: string;
}

export interface NavigationInstruction {
  step: number;
  instruction: string;
  distance: number;
  maneuver: ManeuverType;
  indoor: boolean;
  level?: number;
}

export type ManeuverType = 'straight' | 'left' | 'right' | 'upstairs' | 'downstairs' | 'enter' | 'exit' | 'gate';

export interface VenuePoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  level: number;
  type: VenuePointType;
  accessible: boolean;
}

export type VenuePointType =
  | 'gate'
  | 'section'
  | 'restroom'
  | 'food'
  | 'atm'
  | 'medical'
  | 'exit'
  | 'parking'
  | 'entrance'
  | 'wheelchair'
  | 'elevator'
  | 'escalator'
  | 'charging'
  | 'lost_found'
  | 'info';

export interface VenueMap {
  id: string;
  name: string;
  bounds: { north: number; south: number; east: number; west: number };
  levels: VenueLevel[];
  points: VenuePoint[];
  walls: unknown[];
}

export interface VenueLevel {
  number: number;
  name: string;
  floorPlanUrl: string;
  accessible: boolean;
}
