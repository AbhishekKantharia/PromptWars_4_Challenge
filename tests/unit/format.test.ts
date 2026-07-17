import { formatDuration, formatDate, formatDistance, formatPercent, formatTemperature } from '@/utils/format';

describe('Format Utils', () => {
  it('formats duration in seconds', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  it('formats duration in minutes', () => {
    expect(formatDuration(125)).toBe('2m 5s');
  });

  it('formats duration in exact minutes', () => {
    expect(formatDuration(120)).toBe('2m');
  });

  it('formats distance in meters', () => {
    expect(formatDistance(500)).toBe('500m');
  });

  it('formats distance in kilometers', () => {
    expect(formatDistance(1500)).toBe('1.5km');
  });

  it('formats percent', () => {
    expect(formatPercent(66.6)).toBe('67%');
  });

  it('formats temperature', () => {
    expect(formatTemperature(24)).toBe('24°C');
  });
});
