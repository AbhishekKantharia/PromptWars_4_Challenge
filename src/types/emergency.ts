import type { GeoLocation } from './geo';
import type { VenuePoint } from './navigation';

export interface EmergencyEvent {
  id: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  location: GeoLocation;
  reportedBy: string;
  timestamp: number;
  status: EmergencyStatus;
  responders: string[];
  description: string;
  photos?: string[];
}

export type EmergencyType = 'medical' | 'security' | 'fire' | 'weather' | 'lost_child' | 'structural' | 'crowd_surge';

export type EmergencySeverity = 'low' | 'medium' | 'high' | 'critical';

export type EmergencyStatus = 'reported' | 'acknowledged' | 'responding' | 'resolved' | 'false_alarm';

export interface SOSAlert {
  id: string;
  userId: string;
  location: GeoLocation;
  timestamp: number;
  type: 'personal' | 'medical' | 'security';
  message?: string;
  resolved: boolean;
}

export interface EvacuationRoute {
  id: string;
  name: string;
  exits: VenuePoint[];
  assemblyPoint: GeoLocation;
  estimatedTime: number;
  accessibility: boolean;
  instructions: string[];
}

export interface WeatherAlert {
  id: string;
  type: 'rain' | 'thunderstorm' | 'extreme_heat' | 'high_wind' | 'uv_warning';
  severity: EmergencySeverity;
  message: string;
  startTime: string;
  endTime: string;
  recommendations: string[];
}

export interface LostChildReport {
  id: string;
  childName: string;
  childAge: number;
  childDescription: string;
  lastSeenLocation: GeoLocation;
  lastSeenTime: number;
  guardianName: string;
  guardianContact: string;
  status: 'active' | 'found' | 'closed';
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  location?: GeoLocation;
  available: boolean;
}
