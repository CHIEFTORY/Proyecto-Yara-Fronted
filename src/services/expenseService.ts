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

export const getGroupExpenses = async (
    groupId: number
) => {

    const response =
        await api.get(
            `/gastos/grupo/${groupId}?page=0&size=50`
        );

    return response.data.content;
};

export const deleteExpense = async (
    expenseId: number
) => {

    const response =
        await api.delete(
            `/gastos/${expenseId}`
        );

    return response.data;
};

export const getExpenseById = async (
    expenseId: number
) => {

    const response =
        await api.get(
            `/gastos/${expenseId}`
        );

    return response.data;
};

export const updateExpense = async (
    expenseId: number,
    payload: any
) => {

    const response =
        await api.put(
            `/gastos/${expenseId}`,
            payload
        );

    return response.data;
};