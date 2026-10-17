import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';
const USER_DATA_KEY = 'user_data';

export async function saveAuthData(
    token: string,
    userId: number | string,
    userData: {
        name: string;
        email: string;
        role: string;
    }
) {
    if (Platform.OS === 'web') {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(TOKEN_KEY, token);
                window.localStorage.setItem(USER_ID_KEY, String(userId));
                window.localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
                return;
            }
        } catch {}
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_ID_KEY, String(userId));
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_ID_KEY, String(userId));
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));   
}

export async function getToken() {
    if (Platform.OS === 'web') {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(TOKEN_KEY);
            }
        } catch {}
        return await AsyncStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getUserId() {
    if (Platform.OS === 'web') {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(USER_ID_KEY);
            }
        } catch {}
        return await AsyncStorage.getItem(USER_ID_KEY);
    }
    return await SecureStore.getItemAsync(USER_ID_KEY);
}

export async function getUserData() {
    let data: string | null = null;
    if (Platform.OS === 'web') {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                data = window.localStorage.getItem(USER_DATA_KEY);
            }
        } catch {}
        if (!data) {
            data = await AsyncStorage.getItem(USER_DATA_KEY);
        }
    } else {
        data = await SecureStore.getItemAsync(USER_DATA_KEY);
    }

    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
}

export async function clearAuthToken() {
    if (Platform.OS === 'web') {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(TOKEN_KEY);
                window.localStorage.removeItem(USER_DATA_KEY);
                window.localStorage.removeItem(USER_ID_KEY);
            }
        } catch {}
        await AsyncStorage.removeItem(TOKEN_KEY);
        await AsyncStorage.removeItem(USER_DATA_KEY);
        await AsyncStorage.removeItem(USER_ID_KEY);
        console.log("Information of user is removed ..");
        return;
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
    console.log("Information of user is removerd ..");
}
