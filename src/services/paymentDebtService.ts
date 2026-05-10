import { api } from "./api";

export const createPayment =
    async (payload: any) => {

        const response =
            await api.post(
                "/pagos",
                payload
            );

        return response.data;
    };

export const getGroupPayments =
    async (groupId: number) => {

        const response =
            await api.get(
                `/pagos/grupo/${groupId}`
            );

        return response.data;
    };