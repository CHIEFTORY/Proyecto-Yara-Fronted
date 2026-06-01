import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "auth_token";

const isWeb = Platform.OS === "web";

export const saveToken = async (
    token: string
) => {

    if (isWeb) {
        if (typeof localStorage === "undefined") {
            return;
        }

        localStorage.setItem(TOKEN_KEY, token);
        return;
    }

    await SecureStore.setItemAsync(
        TOKEN_KEY,
        token
    );
};

export const getToken = async () => {

    if (isWeb) {
        if (typeof localStorage === "undefined") {
            return null;
        }

        return localStorage.getItem(TOKEN_KEY);
    }

    return await SecureStore.getItemAsync(
        TOKEN_KEY
    );
};

export const removeToken = async () => {

    if (isWeb) {
        if (typeof localStorage === "undefined") {
            return;
        }

        localStorage.removeItem(TOKEN_KEY);
        return;
    }

    await SecureStore.deleteItemAsync(
        TOKEN_KEY
    );
};

