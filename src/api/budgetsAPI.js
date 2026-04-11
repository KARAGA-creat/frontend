import API from './axios';

export const getBudgets = async () => {
    const response = await API.get('budgets/');
    return response.data;
};

export const createBudget = async (data) => {
    const response = await API.post('budgets/', data);
    return response.data;
};

export const updateBudget = async (id, data) => {
    const response = await API.put(`budgets/${id}/`, data);
    return response.data;
};
