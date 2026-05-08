import { api } from "./api";

import { getToken } from "@/src/utils/authStorage";

export interface CreateGroupRequest {
    nombre: string;
    descripcion?: string;
}

const authHeaders = async () => {

    const token = await getToken();

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getMyGroups = async () => {

    const config = await authHeaders();

    const response = await api.get(
        "/grupos/mios",
        config
    );

    return response.data;
};

export const createGroup = async (
    data: CreateGroupRequest
) => {

    const config = await authHeaders();

    const response = await api.post(
        "/grupos",
        data,
        config
    );

    return response.data;
};

export const getGroupUsers = async (
    groupId: number
) => {

    const config = await authHeaders();

    const response = await api.get(
        `/grupos/${groupId}/usuarios`,
        config
    );

    return response.data;
};

export const getGroupSummary = async (
    groupId: number
) => {

    const config = await authHeaders();

    const response = await api.get(
        `/grupos/${groupId}/resumen`,
        config
    );

    return response.data;
};

export const addUserToGroup = async (
    groupId: number,
    userId: number
) => {

    const config = await authHeaders();

    const response = await api.post(
        `/grupos/${groupId}/usuarios/${userId}`,
        {},
        config
    );

    return response.data;
};

