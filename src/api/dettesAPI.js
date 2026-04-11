import API from './axios';

export const getDettes = async () => {
    const response = await API.get('dettes/');
    return response.data;
};

export const createDette = async (data) => {
    const response = await API.post('dettes/', data);
    return response.data;
};

export const updateDette = async (id, data) => {
    const response = await API.put(`dettes/${id}/`, data);
    return response.data;
};