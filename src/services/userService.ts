import { api } from "./api";

export const searchUsers = async (
    query: string
) => {

    const response = await api.get(
        `/usuarios/buscar?query=${query}`
    );

    return response.data;
};