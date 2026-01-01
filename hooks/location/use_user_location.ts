import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export const useUserLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserLocation = useCallback(async (isManualRefresh = false) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // Check existing status without asking (Silent check)
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

      // Logic to decide if the popup is shown
      let finalStatus = existingStatus;

      // If we don't have permission and it's a manual refresh,
      if (isManualRefresh && existingStatus !== 'granted') {
        console.log("Manual refresh: requesting location permission");
         setLoading(false);
         return; 
      }

      // If it's the first load (not manual refresh) and we don't have permission,
      if (existingStatus !== 'granted') {
          console.log("First load: requesting location permission");
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      // If permission denied after all checks, stop.
      if (finalStatus !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Check if GPS is actually enabled
      const isGPSEnabled = await Location.hasServicesEnabledAsync();

      if (!isGPSEnabled) {
          // If GPS is off and we are manually refreshing
          if (isManualRefresh) {
              setLoading(false);
              return; 
          }
      }

      // Get Position 
      // We use balanced accuracy for better speed and battery life
      let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, 
      });
      
      setLocation(currentLocation);

      // Reverse Geocoding to get the City name
      let address = await Location.reverseGeocodeAsync(currentLocation.coords);
      if (address && address.length > 0) {
        const detectedCity = address[0].city || address[0].region || address[0].subregion;
        setCity(detectedCity || null);
      }

    } catch (error) {
      setErrorMsg('Error fetching location');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount (isManualRefresh = false)
  useEffect(() => {
    getUserLocation(false);
  }, [getUserLocation]);

  return { 
    location, 
    currentCity: city, 
    locationErrorMsg: errorMsg, 
    loadingLocation: loading, 
    // We expose a wrapper to mark it as manual refresh
    refreshLocation: () => getUserLocation(true) 
  };
};