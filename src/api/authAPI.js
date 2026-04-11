import { data } from 'react-router-dom';
import API from './axios';

export const login = async (username, password) => {
    const response = await API.post('auth/login/', {
        username,
        password,
    });
    return response.data;
};

export const logout = async () => {
    await API.post('auth/logout/');
};

export const getUtilisateurs = async () => {
    const response = await API.get('auth/utilisateurs/');
    return response.data;
};

export const creerGestionnaire = async (data) => {
    const response = await API.post('auth/utilisateurs/', data);
    return response.data;
}