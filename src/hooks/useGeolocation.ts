import { useState, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const attemptFetch = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
            loading: false,
          });
        },
        (error) => {
          // Fallback if high accuracy times out
          if (highAccuracy && error.code === error.TIMEOUT) {
            console.log("High accuracy timed out, falling back to standard accuracy...");
            attemptFetch(false);
            return;
          }

          let errorMessage = "Unable to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please check your connection or try again.";
              break;
          }
          setState({
            latitude: null,
            longitude: null,
            error: errorMessage,
            loading: false,
          });
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 15000 : 10000, // 15s for high accuracy, 10s for fallback
          maximumAge: 300000, // 5 minutes cache
        }
      );
    };

    attemptFetch(true);
  }, []);

  const calculateDistance = useCallback(
    (lat2: number, lon2: number): number | null => {
      if (state.latitude === null || state.longitude === null) return null;

      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - state.latitude) * Math.PI) / 180;
      const dLon = ((lon2 - state.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((state.latitude * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [state.latitude, state.longitude]
  );

  return {
    ...state,
    getLocation,
    calculateDistance,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
}
