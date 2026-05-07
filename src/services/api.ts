import axios from "axios";

export const api = axios.create({

    baseURL: "http://192.168.18.13:8080",

    headers: {
        "Content-Type": "application/json",
    },
});