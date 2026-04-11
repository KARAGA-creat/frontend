import API from './axios';

export const getAlertes = async () => {
    const response = await API.get('alertes/');
    return response.data;
};

export const marquerLue = async (id) => {
    const response = await API.patch(`alertes/${id}/lue/`);
    return response.data;
};