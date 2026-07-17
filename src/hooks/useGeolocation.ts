'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GeoLocation } from '@/types';

interface UseGeolocationReturn {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
  refresh: () => void;
}

export function useGeolocation(enableHighAccuracy = true): UseGeolocationReturn {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude ?? undefined,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    });
    setLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setError(err.message);
    setLoading(false);
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout: 10000,
      maximumAge: 30000,
    });
  }, [enableHighAccuracy, handleError, handleSuccess]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, error, loading, refresh };
}
