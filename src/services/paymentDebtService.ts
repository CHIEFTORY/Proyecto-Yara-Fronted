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

export const getPendingPayments =
    async () => {

        const response =
            await api.get(
                "/pagos/pending"
            );

        return response.data;
    };

export const getMyPendingSentPayments =
    async () => {

        const response =
            await api.get(
                "/pagos/mis-pendientes"
            );

        return response.data;
    };

export const getPaymentHistory =
    async () => {

        const response =
            await api.get(
                "/pagos/historial?limit=50"
            );

        return response.data;
    };

export const confirmPayment =
    async (paymentId: number) => {

        await api.put(
            `/pagos/${paymentId}/confirmar`
        );
    };

export const rejectPayment =
    async (paymentId: number) => {

        await api.put(
            `/pagos/${paymentId}/rechazar`
        );
    };
