import { useEffect } from "react";
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
} from '@react-native-google-signin/google-signin';

export const useGoogleAuthRedirection = (
  onLoginSuccess: (idToken: string) => Promise<void>,
  onLoginFailed: (error?: string) => void,
) => {

  const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || ""
  const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || ""

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      iosClientId: IOS_CLIENT_ID,
      scopes: ['profile', 'email'],
      offlineAccess: true,
      forceCodeForRefreshToken: false,
    });
  }, []);

  const promptAsync = async () => {
    try {
      // check if users' device has google play services
      await GoogleSignin.hasPlayServices();

      // Logout each request for reset the auth status
      // and always display the email selection form
      try {
        await GoogleSignin.signOut();
      } catch (e) {
        // Ignores in case of error
      }

      // initiates signIn process
      const response = await GoogleSignin.signIn();

      // retrieve user data
      const { idToken } = response.data ?? {};

      if (idToken) {
        await onLoginSuccess(idToken);
      } else {
        onLoginFailed("No ID Token found");
      }

    } catch (error) {
      console.log('Error', error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            onLoginFailed("Play services not available or outdated");
            break;
          default:
            onLoginFailed();
        }
      } else {
        onLoginFailed();
      }
    }
  };

  return { promptAsync };
}