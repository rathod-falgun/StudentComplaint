import { clearAuthToken, getToken } from '@/utils/authStorage';
import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';


const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE) {
    return process.env.EXPO_PUBLIC_API_BASE.replace(/\/$/, '');
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:10000`;
  }
  return 'http://10.118.31.1:10000';
};

export const API_BASE_URL = getBaseUrl();

// for jwt authorization
let isSessionAlertActive = false;

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  // get jwt from async Storage
  const token = await getToken();

  // create headers 
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Detect FormData robustly across web, iOS, and Android
  const isFormData =
    options.body instanceof FormData ||
    (typeof options.body === 'object' && options.body !== null && 'append' in options.body);

  if (!isFormData && !options.headers?.hasOwnProperty('Content-Type')) {
    headers["Content-Type"] = "application/json";
  }

  // Normalize endpoint to ensure it always starts with '/'
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // send request to backend
  const response = await fetch(
    `${API_BASE_URL}${cleanEndpoint}`,
    {
      ...options,
      headers: {
        ...headers,
        ...((options.headers as Record<string, string>) || {}),
      },
    }
  );

  if (response.status === 401) {
    await clearAuthToken();

    if (!isSessionAlertActive) {
      isSessionAlertActive = true;
      const onAlertDismiss = () => {
        isSessionAlertActive = false;
        router.replace('/login');
      };

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Your session has expired. Please log in again.');
        onAlertDismiss();
      } else {
        Alert.alert(
          'Session Expired',
          'Your session has expired, please log in again.',
          [
            {
              text: 'OK',
              onPress: onAlertDismiss,
            },
          ]
        );
      }
    }
  }

  return response;
};

