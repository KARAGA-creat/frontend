import API from './axios';

export const getRapports = async () => {
    const response = await API.get('rapports/');
    return response.data;
};

export const genererRapport = async (mois, annee) => {
    const response = await API.post('rapports/generer/', {
        mois,
        annee,
    });
    return response.data;
};