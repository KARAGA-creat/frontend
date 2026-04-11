import API from './axios';

export const getTransactions = async () => {
    const response = await API.get('transactions/');
    return response.data;
};

export const createTransaction = async (data) => {
    const response = await API.post('transactions/', data);
    return response.data;
};

export const updateTransaction = async (id, data) => {
    const response = await API.put(`transactions/${id}/`, data);
    return response.data;
};

export const deleteTransaction = async (id) => {
    await API.delete(`transactions/${id}/`);
};