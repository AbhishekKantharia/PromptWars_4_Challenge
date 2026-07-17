import type { GeoLocation } from './geo';

export interface CarbonFootprint {
  userId: string;
  travelEmissions: number;
  foodEmissions: number;
  merchandiseEmissions: number;
  totalEmissions: number;
  offsetSuggestions: OffsetSuggestion[];
  greenScore: number;
}

export interface OffsetSuggestion {
  id: string;
  type: string;
  description: string;
  estimatedOffset: number;
  cost?: number;
  url?: string;
}

export interface WasteStation {
  id: string;
  location: GeoLocation;
  type: 'recycling' | 'compost' | 'landfill' | 'mixed';
  fillLevel: number;
  lastEmptied: number;
}

export interface RefillStation {
  id: string;
  location: GeoLocation;
  type: 'water' | 'fountain' | 'bottle_filling';
  accessible: boolean;
  lastMaintenance: number;
}

export interface GreenTravelOption {
  id: string;
  type: string;
  description: string;
  emissionsSaved: number;
  cost: number;
  duration: number;
}
