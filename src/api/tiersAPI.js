import API from './axios';

export const getTiers = async () => {
    const response = await API.get('tiers/');
    return response.data;
};

export const createTiers = async (data) => {
    const response = await API.post('tiers/', data);
    return response.data;
};

export const updateTiers = async (id, data) => {
    const response = await API.put(`tiers/${id}/`, data);
    return response.data;
};

export const deleteTiers = async (id) => {
    await API.delete(`tiers/${id}/`);
};