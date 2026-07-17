import type { GeoLocation } from './geo';

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  capacity: number;
  gates: VenueGate[];
  levels: VenueLevelWithSections[];
  amenities: VenueAmenity[];
  matchSchedule: MatchInfo[];
}

export interface VenueGate {
  id: string;
  name: string;
  location: GeoLocation;
  capacity: number;
  currentFlow: number;
  accessible: boolean;
  open: boolean;
}

export interface VenueLevelWithSections {
  number: number;
  name: string;
  sections: VenueSection[];
  accessible: boolean;
}

export interface VenueSection {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
}

export interface VenueAmenity {
  id: string;
  type: string;
  name: string;
  location: GeoLocation;
  level: number;
  accessible: boolean;
  open: boolean;
}

export interface MatchInfo {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  stage: string;
  status: 'upcoming' | 'live' | 'finished';
}


