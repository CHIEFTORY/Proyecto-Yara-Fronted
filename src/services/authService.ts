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

export const getMeRequest = async (
    token: string
) => {

    const response = await api.get(
        "/auth/me",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};