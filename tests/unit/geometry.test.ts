import { haversineDistance, estimateWalkTime, isPointInPolygon, getCentroid } from '@/utils/geometry';

describe('Geometry Utils', () => {
  describe('haversineDistance', () => {
    it('calculates distance between two points', () => {
      const a = { lat: 40.8128, lng: -74.0745 };
      const b = { lat: 40.8135, lng: -74.0740 };
      const dist = haversineDistance(a, b);
      expect(dist).toBeGreaterThan(0);
      expect(dist).toBeLessThan(500);
    });

    it('returns 0 for same point', () => {
      const p = { lat: 40.8128, lng: -74.0745 };
      expect(haversineDistance(p, p)).toBe(0);
    });
  });

  describe('estimateWalkTime', () => {
    it('estimates walk time in seconds', () => {
      const time = estimateWalkTime(140);
      expect(time).toBeCloseTo(100, 0);
    });

    it('uses default walking speed', () => {
      const time = estimateWalkTime(70);
      expect(time).toBeCloseTo(50, 0);
    });
  });

  describe('isPointInPolygon', () => {
    it('detects point inside polygon', () => {
      const polygon = [
        { lat: 0, lng: 0 }, { lat: 0, lng: 10 },
        { lat: 10, lng: 10 }, { lat: 10, lng: 0 },
      ];
      expect(isPointInPolygon({ lat: 5, lng: 5 }, polygon)).toBe(true);
    });

    it('detects point outside polygon', () => {
      const polygon = [
        { lat: 0, lng: 0 }, { lat: 0, lng: 10 },
        { lat: 10, lng: 10 }, { lat: 10, lng: 0 },
      ];
      expect(isPointInPolygon({ lat: 15, lng: 5 }, polygon)).toBe(false);
    });
  });

  describe('getCentroid', () => {
    it('calculates centroid of points', () => {
      const points = [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 10 },
        { lat: 10, lng: 10 },
        { lat: 10, lng: 0 },
      ];
      const centroid = getCentroid(points);
      expect(centroid.lat).toBeCloseTo(5);
      expect(centroid.lng).toBeCloseTo(5);
    });
  });
});
