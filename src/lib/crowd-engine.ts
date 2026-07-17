import type { CrowdZone, CrowdHeatmapData, DensityLevel, CongestionPoint, CrowdPrediction, AIRecommendation } from '@/types/crowd';

const ZONE_CONFIGS: { id: string; name: string; capacity: number; baseLat: number; baseLng: number }[] = [
  { id: 'gate-n', name: 'North Gate', capacity: 8000, baseLat: 40.8135, baseLng: -74.0745 },
  { id: 'gate-s', name: 'South Gate', capacity: 8000, baseLat: 40.8120, baseLng: -74.0745 },
  { id: 'gate-e', name: 'East Gate', capacity: 6000, baseLat: 40.8128, baseLng: -74.0730 },
  { id: 'gate-w', name: 'West Gate', capacity: 6000, baseLat: 40.8128, baseLng: -74.0760 },
  { id: 'concourse-n', name: 'North Concourse', capacity: 12000, baseLat: 40.8138, baseLng: -74.0745 },
  { id: 'concourse-s', name: 'South Concourse', capacity: 12000, baseLat: 40.8117, baseLng: -74.0745 },
  { id: 'vip', name: 'VIP Lounge', capacity: 2000, baseLat: 40.8130, baseLng: -74.0745 },
  { id: 'food-court', name: 'Food Court', capacity: 5000, baseLat: 40.8125, baseLng: -74.0750 },
];

export function generateCrowdData(matchProgress: number): CrowdHeatmapData {
  const zones: CrowdZone[] = ZONE_CONFIGS.map((config) => {
    const peakFactor = getPeakFactor(matchProgress);
    const currentOccupancy = Math.round(config.capacity * peakFactor * (0.6 + Math.random() * 0.4));
    return {
      id: config.id,
      name: config.name,
      capacity: config.capacity,
      currentOccupancy: Math.min(currentOccupancy, config.capacity),
      densityLevel: getDensityLevel(currentOccupancy / config.capacity),
      coordinates: [
        { latitude: config.baseLat, longitude: config.baseLng },
        { latitude: config.baseLat + 0.0005, longitude: config.baseLng },
        { latitude: config.baseLat + 0.0005, longitude: config.baseLng + 0.001 },
        { latitude: config.baseLat, longitude: config.baseLng + 0.001 },
      ],
      lastUpdated: Date.now(),
    };
  });

  const totalAttendance = zones.reduce((sum, z) => sum + z.currentOccupancy, 0);
  const avgDensity = calculateAverageDensity(zones);
  const congestionPoints = findCongestionPoints(zones);
  const predictions = generatePredictions(zones, matchProgress);

  return {
    zones,
    totalAttendance,
    averageDensity: avgDensity,
    congestionPoints,
    predictions,
    timestamp: Date.now(),
  };
}

function getPeakFactor(progress: number): number {
  if (progress < 0.1) return 0.3 + progress * 3;
  if (progress < 0.3) return 0.6 + (progress - 0.1) * 1.5;
  if (progress < 0.8) return 0.9;
  if (progress < 0.95) return 0.9 - (progress - 0.8) * 2;
  return 0.5;
}

function getDensityLevel(ratio: number): DensityLevel {
  if (ratio < 0.3) return 'low';
  if (ratio < 0.5) return 'moderate';
  if (ratio < 0.7) return 'high';
  if (ratio < 0.9) return 'very_high';
  return 'critical';
}

function calculateAverageDensity(zones: CrowdZone[]): DensityLevel {
  const avgRatio = zones.reduce((sum, z) => sum + z.currentOccupancy / z.capacity, 0) / zones.length;
  return getDensityLevel(avgRatio);
}

function findCongestionPoints(zones: CrowdZone[]): CongestionPoint[] {
  return zones
    .filter((z) => z.densityLevel === 'high' || z.densityLevel === 'very_high' || z.densityLevel === 'critical')
    .map((z) => ({
      id: `congestion-${z.id}`,
      location: z.coordinates[0],
      severity: z.currentOccupancy / z.capacity,
      estimatedWaitTime: Math.round((z.currentOccupancy / z.capacity) * 600),
      alternativeRoute: findAlternative(z.id),
    }));
}

function findAlternative(zoneId: string): string | undefined {
  const alternatives: Record<string, string> = {
    'gate-n': 'Use South Gate or East Gate for shorter queues',
    'gate-s': 'Use North Gate or West Gate for shorter queues',
    'gate-e': 'Use West Gate for shorter queues',
    'gate-w': 'Use East Gate for shorter queues',
    'concourse-n': 'Try the South Concourse level',
    'concourse-s': 'Try the North Concourse level',
    'food-court': 'Vendor stalls available at Gate entrances',
    'vip': 'VIP Overflow lounge available at Section 210',
  };
  return alternatives[zoneId];
}

function generatePredictions(zones: CrowdZone[], progress: number): CrowdPrediction[] {
  return zones.slice(0, 4).map((z) => {
    const futureRatio = Math.min(1, (z.currentOccupancy / z.capacity) * (1 + (0.3 - progress) * 0.5));
    return {
      zoneId: z.id,
      predictedDensity: getDensityLevel(futureRatio),
      predictedTime: Date.now() + 1800000,
      confidence: 0.7 + Math.random() * 0.25,
      recommendation: futureRatio > 0.8 ? 'Consider alternative entry points' : 'Normal flow expected',
    };
  });
}

export function generateAIRecommendations(data: CrowdHeatmapData): AIRecommendation[] {
  const recs: AIRecommendation[] = [];

  if (data.congestionPoints.length > 0) {
    recs.push({
      id: 'rec-congestion',
      type: 'entrance',
      message: `${data.congestionPoints.length} congested zones detected. Consider redirecting fans to less busy entrances.`,
      confidence: 0.85,
    });
  }

  const criticalZones = data.zones.filter((z) => z.densityLevel === 'critical');
  if (criticalZones.length > 0) {
    recs.push({
      id: 'rec-critical',
      type: 'route',
      message: `Critical density at ${criticalZones.map((z) => z.name).join(', ')}. Deploy additional staff.`,
      confidence: 0.95,
    });
  }

  if (data.averageDensity === 'low' || data.averageDensity === 'moderate') {
    recs.push({
      id: 'rec-normal',
      type: 'timing',
      message: 'Venue is at comfortable capacity. Good time for new arrivals.',
      confidence: 0.9,
    });
  }

  return recs;
}
