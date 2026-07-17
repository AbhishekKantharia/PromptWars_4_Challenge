import type { VenuePoint } from './navigation';
import type { GeoLocation } from './geo';

export interface AccessibilityRoute {
  id: string;
  origin: VenuePoint;
  destination: VenuePoint;
  wheelchairAccessible: boolean;
  elevatorAvailable: boolean;
  rampAvailable: boolean;
  tactilePaving: boolean;
  audioAnnouncements: boolean;
  brailleSignage: boolean;
  estimatedTime: number;
  distance: number;
  instructions: string[];
}

export interface AccessibleFacility {
  id: string;
  type: 'restroom' | 'parking' | 'entrance' | 'seating' | 'counter' | 'elevator';
  location: GeoLocation;
  level: number;
  wheelchairAccessible: boolean;
  companionAccessible: boolean;
  hoistAvailable: boolean;
  grabBars: boolean;
  loweredCounter: boolean;
  nearbyAssistance: boolean;
}

export interface VoiceCommand {
  id: string;
  command: string;
  intent: string;
  entities: Record<string, string>;
  timestamp: number;
  processed: boolean;
}
