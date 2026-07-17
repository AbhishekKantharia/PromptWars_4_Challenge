export interface CrowdZone {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  densityLevel: DensityLevel;
  coordinates: GeoCoordinate[];
  lastUpdated: number;
}

export type DensityLevel = 'low' | 'moderate' | 'high' | 'very_high' | 'critical';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface CrowdHeatmapData {
  zones: CrowdZone[];
  totalAttendance: number;
  averageDensity: DensityLevel;
  congestionPoints: CongestionPoint[];
  predictions: CrowdPrediction[];
  timestamp: number;
}

export interface CongestionPoint {
  id: string;
  location: GeoCoordinate;
  severity: number;
  estimatedWaitTime: number;
  alternativeRoute?: string;
}

export interface CrowdPrediction {
  zoneId: string;
  predictedDensity: DensityLevel;
  predictedTime: number;
  confidence: number;
  recommendation: string;
}

export interface CrowdAlert {
  id: string;
  type: CrowdAlertType;
  zoneId: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  resolved: boolean;
}

export type CrowdAlertType = 'congestion' | 'capacity' | 'evacuation' | 'incident';

export interface AIRecommendation {
  id: string;
  type: 'route' | 'entrance' | 'timing' | 'alternative';
  message: string;
  action?: NavigationAction;
  confidence: number;
}

export interface NavigationAction {
  type: 'reroute' | 'suggest_entrance' | 'delay_arrival';
  payload: Record<string, unknown>;
}
