import { api } from "./api";

export interface UserProfile {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
    yapeNumero?: string;
}

export type MetodoCobroTipo = "YAPE" | "PLIN" | "BANCO";

export interface MetodoCobro {
    id?: number | null;
    tipo: MetodoCobroTipo;
    alias?: string;
    numeroTelefono?: string;
    bancoNombre?: string;
    cuentaNumero?: string;
    cci?: string;
    titular?: string;
    predeterminado?: boolean;
}

export interface UpdateProfileRequest {
    nombre: string;
    telefono: string;
}

export interface ChangePasswordRequest {
    passwordActual: string;
    nuevaPassword: string;
}

export interface UpdateYapeRequest {

    yapeNumero: string;
}

export const searchUsers = async (
    query: string
) => {

    const response = await api.get(
        `/usuarios/buscar?query=${query}`
    );

    return response.data;
};

export const getProfile =
    async (): Promise<UserProfile> => {

        const response =
            await api.get("/usuarios/me");

        return response.data;
    };

export const updateProfile =
    async (
        data: UpdateProfileRequest
    ) => {

        await api.put(
            "/usuarios/me",
            data
        );
    };

export const changePassword =
    async (
        data: ChangePasswordRequest
    ) => {

        await api.put(
            "/usuarios/me/password",
            data
        );
    };

export const updateYape =
    async (
        data: UpdateYapeRequest
    ) => {

        await api.put(
            "/usuarios/yape",
            data
        );
    };

export const getCollectionMethods =
    async (): Promise<MetodoCobro[]> => {

        const response =
            await api.get(
                "/usuarios/metodos-cobro"
            );

        return response.data;
    };

export const createCollectionMethod =
    async (
        data: Partial<MetodoCobro>
    ): Promise<MetodoCobro> => {

        const response =
            await api.post(
                "/usuarios/metodos-cobro",
                data
            );

        return response.data;
    };

export const updateCollectionMethod =
    async (
        id: number,
        data: Partial<MetodoCobro>
    ): Promise<MetodoCobro> => {

        const response =
            await api.put(
                `/usuarios/metodos-cobro/${id}`,
                data
            );

        return response.data;
    };

export const setDefaultCollectionMethod =
    async (
        id: number
    ): Promise<MetodoCobro> => {

        const response =
            await api.put(
                `/usuarios/metodos-cobro/${id}/predeterminado`
            );

        return response.data;
    };

export const deleteCollectionMethod =
    async (
        id: number
    ) => {

        await api.delete(
            `/usuarios/metodos-cobro/${id}`
        );
    };
