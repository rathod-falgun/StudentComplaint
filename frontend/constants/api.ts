import { clearAuthToken, getToken } from '@/utils/authStorage';
import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';


const getBaseUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:8081`;
  }
  if (process.env.EXPO_PUBLIC_API_BASE) {
    return process.env.EXPO_PUBLIC_API_BASE;
  }
  return 'http://10.163.139.154:8081';
};

export const API_BASE_URL = getBaseUrl();

// for jwt authorization

const api_base_url =  process.env.EXPO_PUBLIC_API_BASE;

export const apiFetch = async(
  endpoint : string,
  options : RequestInit = {}
) => {
  // get jwt from async Storage

  const token = await getToken();

  // create headers 
  const headers : Record<string , string> = {};
  
  
  if(token){
    headers["Authorization"] =  `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  // send request to backend
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers:{
        ...headers,
        ...(options.headers as Record<string , string> || {}),
      },
    }
  );

  if(response.status == 401){
    await clearAuthToken();

    if(Platform.OS == "web"){
      window.alert("Your session is expired ! u need to login.");
      router.replace("/login");
    }else{

    Alert.alert("Session Expired" , "Your Session is Expired , please login again" ,[
      {
        text: "OK",
        onPress : () => {
          router.replace('/login');
        },
      },
    ]);
  }
}
return response;
};
