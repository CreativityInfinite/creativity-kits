import { haversine } from '../utils/haversine';
import { describe, it, expect } from 'vitest';

describe('haversine', () => {
  it('computes known distance roughly between Paris and London (~343km)', () => {
    const paris = { lat: 48.8566, lon: 2.3522 };
    const london = { lat: 51.5074, lon: -0.1278 };
    const d = haversine(paris.lat, paris.lon, london.lat, london.lon) / 1000;
    expect(d).toBeGreaterThan(300);
    expect(d).toBeLessThan(400);
  });
});
