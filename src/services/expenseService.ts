import { api } from "./api";

export const createExpense =
    async (data: any) => {

        const response =
            await api.post(
                "/gastos",
                data
            );

        return response.data;
    };