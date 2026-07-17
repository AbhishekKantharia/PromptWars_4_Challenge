import { generateCrowdData, generateAIRecommendations } from '@/lib/crowd-engine';

describe('Crowd Engine', () => {
  it('generates crowd data with valid structure', () => {
    const data = generateCrowdData(0.5);
    expect(data).toHaveProperty('zones');
    expect(data).toHaveProperty('totalAttendance');
    expect(data).toHaveProperty('averageDensity');
    expect(data).toHaveProperty('congestionPoints');
    expect(data).toHaveProperty('predictions');
    expect(data).toHaveProperty('timestamp');
    expect(data.zones.length).toBeGreaterThan(0);
    expect(data.totalAttendance).toBeGreaterThan(0);
  });

  it('generates different data based on match progress', () => {
    const early = generateCrowdData(0.1);
    const mid = generateCrowdData(0.5);
    const late = generateCrowdData(0.95);
    expect(early.totalAttendance).not.toBe(mid.totalAttendance);
  });

  it('generates valid density levels', () => {
    const validLevels = ['low', 'moderate', 'high', 'very_high', 'critical'];
    const data = generateCrowdData(0.5);
    data.zones.forEach((zone) => {
      expect(validLevels).toContain(zone.densityLevel);
    });
  });

  it('generates AI recommendations', () => {
    const data = generateCrowdData(0.5);
    const recs = generateAIRecommendations(data);
    expect(Array.isArray(recs)).toBe(true);
    recs.forEach((rec) => {
      expect(rec).toHaveProperty('id');
      expect(rec).toHaveProperty('message');
      expect(rec).toHaveProperty('confidence');
      expect(rec.confidence).toBeGreaterThan(0);
      expect(rec.confidence).toBeLessThanOrEqual(1);
    });
  });
});
