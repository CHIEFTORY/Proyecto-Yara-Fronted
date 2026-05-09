import { api } from "./api";

export interface CreateGroupRequest {
    nombre: string;
    descripcion?: string;
}

export const getMyGroups = async () => {

    const response = await api.get(
        "/grupos/mios"
    );

    return response.data;
};

export const createGroup = async (
    data: CreateGroupRequest
) => {

    const response = await api.post(
        "/grupos",
        data
    );

    return response.data;
};

export const getGroupUsers = async (
    groupId: number
) => {

    const response = await api.get(
        `/grupos/${groupId}/usuarios`
    );

    return response.data;
};

export const getGroupSummary = async (
    groupId: number
) => {

    const response = await api.get(
        `/grupos/${groupId}/resumen`
    );

    return response.data;
};

export const addUserToGroup = async (
    groupId: number,
    userId: number
) => {

    const response = await api.post(
        `/grupos/${groupId}/usuarios/${userId}`
    );

    return response.data;
};

export const deleteGroup = async (
    groupId: number
) => {

    const response =
        await api.delete(
            `/grupos/${groupId}`
        );

    return response.data;
};