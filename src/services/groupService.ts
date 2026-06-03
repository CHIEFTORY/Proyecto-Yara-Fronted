import { api } from "./api";

export interface CreateGroupRequest {
    nombre: string;
    descripcion?: string;
    color?: string;
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

export const updateGroup = async (
    groupId: number,
    data: CreateGroupRequest
) => {

    const response = await api.put(
        `/grupos/${groupId}`,
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
export const leaveGroup = async (
    groupId: number
) => {

    const response =
        await api.delete(
            `/grupos/${groupId}/salir`
        );

    return response.data;
};

export const removeGroupUser = async (
    groupId: number,
    userId: number
) => {

    const response =
        await api.delete(
            `/grupos/${groupId}/usuarios/${userId}`
        );

    return response.data;
};
export const getDashboardBalance =
    async () => {

        const response =
            await api.get(
                "/grupos/dashboard-balance"
            );

        return response.data;
    };

export const makeAdmin = async (
    groupId: number,
    userId: number
) => {

    const response =
        await api.put(
            `/grupos/${groupId}/usuarios/${userId}/admin`
        );

    return response.data;
};
