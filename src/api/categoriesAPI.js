import API from './axios';

export const getCategories = async () => {
    const response = await API.get('categories/');
    return response.data;
};

export const createCategorie = async (data) => {
    const response = await API.post('categories/', data);
    return response.data;
};

export const deleteCategorie = async (id) => {
    await API.delete(`categories/${id}/`);
};