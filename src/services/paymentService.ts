import { api } from "./api";

export const getPaymentMethods =
    async () => {

        const response =
            await api.get(
                "/metodos-pago"
            );

        return response.data;
    };

export const savePaymentMethod =
    async (payload: any) => {

        const response =
            await api.post(
                "/metodos-pago",
                payload
            );

        return response.data;
    };


export const deletePaymentMethod =
    async (id: number) => {

        await api.delete(
            `/metodos-pago/${id}`
        );
    };