export interface OperationsDashboard {
  venueId: string;
  timestamp: number;
  crowd: CrowdStats;
  incidents: IncidentStats;
  volunteers: VolunteerStats;
  transport: TransportStats;
  weather: WeatherInfo;
  aiSummary: string;
}

export interface CrowdStats {
  totalAttendance: number;
  capacity: number;
  occupancyPercent: number;
  peakZone: string;
  averageWaitTime: number;
  activeAlerts: number;
}

export interface IncidentStats {
  total: number;
  active: number;
  resolved: number;
  critical: number;
  averageResponseTime: number;
}

export interface VolunteerStats {
  total: number;
  onDuty: number;
  onBreak: number;
  tasksPending: number;
  tasksCompleted: number;
}

export interface TransportStats {
  metroLoad: number;
  busLoad: number;
  parkingAvailable: number;
  trafficLevel: string;
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  alerts: string[];
}

export interface OperationalAlert {
  id: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  source: string;
  timestamp: number;
  acknowledged: boolean;
}
