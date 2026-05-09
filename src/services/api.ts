import axios from "axios";

import {
    getToken,
} from "@/src/utils/authStorage";

export const api = axios.create({

    baseURL: "http://192.168.18.13:8080",

    headers: {
        "Content-Type": "application/json",
    },
});

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