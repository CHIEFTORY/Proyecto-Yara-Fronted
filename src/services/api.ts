import {
    create,
} from "axios";

import {
    router,
} from "expo-router";

import {
    getToken,
    removeToken,
} from "@/src/utils/authStorage";

export const api = create({

    baseURL: "https://proyecto-yara-backend-production.up.railway.app",
    //baseURL: "http://192.168.18.13:8080",
    timeout: 9000,
    headers: {
        "Content-Type": "application/json",
    },
});

const SERVER_DOWN_STATUSES = [500, 502, 503, 504, 521, 522, 523, 524];
let serverDownNavigationScheduled = false;

const isServerDownError = (error: any) => {
    const message = String(error?.message || "").toLowerCase();
    const code = String(error?.code || "").toUpperCase();

    if (
        code === "ECONNABORTED"
        || code === "ERR_NETWORK"
        || code === "ERR_BAD_RESPONSE"
        || message.includes("network error")
        || message.includes("network request failed")
        || message.includes("timeout")
        || message.includes("failed to fetch")
    ) {
        return true;
    }

    if (!error.response) {
        return true;
    }

    return SERVER_DOWN_STATUSES.includes(error.response.status);
};

const shouldSkipServerDownRedirect = (error: any) => {
    const url = String(error?.config?.url || "");
    return url.includes("/health");
};

const goToServerDown = () => {
    if (serverDownNavigationScheduled) return;

    serverDownNavigationScheduled = true;
    setTimeout(() => {
        router.replace("/server-down" as any);
        setTimeout(() => {
            serverDownNavigationScheduled = false;
        }, 1200);
    }, 0);
};

api.interceptors.request.use(

    async (config) => {

        const token =
            await getToken();

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {

        return Promise.reject(error);
    }
);

api.interceptors.response.use(

    (response) => response,

    async (error) => {

        // 🔥 TOKEN INVÁLIDO

        if (
            error.response?.status === 401 ||
            error.response?.status === 403
        ) {

            await removeToken();

            router.replace("/login" as any);

            return Promise.reject(error);
        }

        // 🔥 SERVIDOR CAÍDO / SIN RESPUESTA

        if (
            isServerDownError(error)
            && !shouldSkipServerDownRedirect(error)
        ) {

            goToServerDown();
        }

        return Promise.reject(error);
    }
);
