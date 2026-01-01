import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export const useUserLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserLocation = useCallback(async (isManualRefresh = false): Promise<string | null | undefined> => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      if (isManualRefresh && existingStatus !== 'granted') {
         setLoading(false);
         return null; // Return null (no location)
      }

      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return null; // Return null
      }

      const isGPSEnabled = await Location.hasServicesEnabledAsync();

      if (!isGPSEnabled) {
          if (isManualRefresh) {
            setLocation(null)
            setCity(null);
            setErrorMsg('GPS is disabled');
            setLoading(false);
            return null; // Return null (Explicitly indicate location is gone)
          }
      }

      let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, 
      });
      
      setLocation(currentLocation);

      let detectedCity = null; // Default to null
      let address = await Location.reverseGeocodeAsync(currentLocation.coords);

      if (address && address.length > 0) {
        detectedCity = address[0].city || address[0].region || address[0].subregion || null;
        setCity(detectedCity);
      }
      
      return detectedCity; 

    } catch (error) {
      setErrorMsg('Error fetching location');
      return undefined; // Return undefined on error to prevent state overwrite
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
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