import { api } from "./api";

import { getToken } from "@/src/utils/authStorage";

const authHeaders = async () => {

    const token = await getToken();

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const searchUsers = async (
    query: string
) => {

    const config = await authHeaders();

    const response = await api.get(
        `/usuarios/buscar?query=${query}`,
        config
    );

    return response.data;
};