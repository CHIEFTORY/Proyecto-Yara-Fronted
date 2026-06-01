import { api } from "./api";

export const loginRequest = async (
    email: string,
    password: string
) => {

    const response = await api.post(
        "/auth/login",
        {
            email,
            password,
        }
    );

    return response.data;
};

export const getMeRequest = async () => {

    const response = await api.get(
        "/auth/me"
    );

    return response.data;
};

export const registerRequest = async (

    nombre: string,
    email: string,
    telefono: string,
    password: string

) => {

    const response = await api.post(
        "/auth/register",
        {
            nombre,
            email,
            telefono,
            password,
        }
    );

    return response.data;
};

export const requestPasswordReset = async (
    email: string
) => {

    const response = await api.post(
        "/auth/password-reset/request",
        {
            email,
        }
    );

    return response.data;
};

export const confirmPasswordReset = async (
    email: string,
    otp: string,
    nuevaPassword: string
) => {

    const response = await api.post(
        "/auth/password-reset/confirm",
        {
            email,
            otp,
            nuevaPassword,
        }
    );

    return response.data;
};
