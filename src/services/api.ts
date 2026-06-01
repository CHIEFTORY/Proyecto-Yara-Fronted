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
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

const SERVER_DOWN_STATUSES = [502, 503, 504, 521, 522, 523, 524];

const isServerDownError = (error: any) => {
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
        return true;
    }

    if (!error.response) {
        return true;
    }

    return SERVER_DOWN_STATUSES.includes(error.response.status);
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

        if (isServerDownError(error)) {

            router.replace(
                "/server-down" as any
            );
        }

        return Promise.reject(error);
    }
);
