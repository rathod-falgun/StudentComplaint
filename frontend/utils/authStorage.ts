import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'user_id';
const USER_DATA_KEY = 'user_data';

export async function saveAuthData(
    token:string,
    userId : number | string,
    userData : {
        name : string;
        email : string;
        role : string;
    }
) {
    await SecureStore.setItemAsync(TOKEN_KEY , token);
    await SecureStore.setItemAsync(USER_ID_KEY, String(userId));
    await SecureStore.setItemAsync(USER_DATA_KEY,JSON.stringify(userData));   
}

export async function getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
}
export async function getUserId() {
    return await SecureStore.getItemAsync(USER_ID_KEY);
}
export async function getUserData() {
    const data = await SecureStore.getItemAsync(USER_DATA_KEY);

    if(!data) return null;

    try{
        return JSON.parse(data);
    }catch{
        return null;
    }
}
export async function clearAuthToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
    console.log("Information of user is removerd ..");
}
