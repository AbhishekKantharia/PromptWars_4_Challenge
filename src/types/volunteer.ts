import type { VenuePoint } from './navigation';
import type { GeoLocation } from './geo';

export interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  location: VenuePoint;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  requiredSkills: string[];
}

export interface VolunteerSchedule {
  userId: string;
  shifts: VolunteerShift[];
}

export interface VolunteerShift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  area: string;
  role: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  helpful: number;
  notHelpful: number;
}

export interface IncidentReport {
  id: string;
  reporterId: string;
  type: string;
  location: GeoLocation;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'reported' | 'investigating' | 'resolved';
  timestamp: number;
  photos?: string[];
}
