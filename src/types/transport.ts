import type { GeoLocation } from './geo';

export interface TransportOption {
  id: string;
  type: TransportType;
  name: string;
  provider: string;
  departureTime: string;
  arrivalTime: string;
  origin: GeoLocation;
  destination: GeoLocation;
  capacity: number;
  available: boolean;
  price?: number;
  accessibility: boolean;
  route?: string[];
}

export type TransportType = 'metro' | 'bus' | 'taxi' | 'rideshare' | 'parking' | 'walking' | 'bicycle';

export interface TransportRoute {
  id: string;
  type: TransportType;
  name: string;
  stops: TransportStop[];
  frequency: number;
  firstDeparture: string;
  lastDeparture: string;
  accessible: boolean;
}

export interface TransportStop {
  id: string;
  name: string;
  location: GeoLocation;
  routes: string[];
  amenities: string[];
}

export interface ParkingInfo {
  id: string;
  name: string;
  location: GeoLocation;
  totalSpaces: number;
  availableSpaces: number;
  pricePerHour: number;
  accessible: boolean;
  evCharging: boolean;
  distanceToVenue: number;
  walkTime: number;
}

export interface TrafficInfo {
  route: string;
  congestionLevel: 'free_flow' | 'light' | 'moderate' | 'heavy' | 'severe';
  estimatedDelay: number;
  incidents: TrafficIncident[];
}

export interface TrafficIncident {
  type: 'accident' | 'construction' | 'event' | 'closure';
  location: GeoLocation;
  description: string;
  severity: number;
  estimatedClearance: string;
}

export interface ReturnTripPlan {
  matchEndTime: string;
  transportType: TransportType;
  estimatedDeparture: string;
  estimatedArrival: string;
  alternatives: TransportOption[];
}
