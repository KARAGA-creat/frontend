import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || '') + '/api/';

const API = axios.create({ baseURL: BASE });

// Attache le token JWT à chaque requête
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// File d'attente pour les requêtes bloquées pendant le refresh
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
    failedQueue = [];
};

// Intercepteur réponse : refresh automatique sur 401
API.interceptors.response.use(
    response => response,
    async error => {
        const original = error.config;

        // Si 401 et pas déjà en train de retry
        if (error.response?.status === 401 && !original._retry) {

            // Si un refresh est déjà en cours, on met la requête en file d'attente
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return API(original);
                });
            }

            original._retry  = true;
            isRefreshing     = true;
            const refresh    = localStorage.getItem('refresh_token');

            if (!refresh) {
                // Pas de refresh token → déconnexion
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Tente de renouveler l'access token
                const res      = await axios.post('/api/auth/refresh/', { refresh });
                const newToken = res.data.access;
                localStorage.setItem('access_token', newToken);
                API.defaults.headers.common.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                original.headers.Authorization = `Bearer ${newToken}`;
                return API(original);
            } catch (refreshError) {
                // Refresh échoué → déconnexion
                processQueue(refreshError, null);
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default API;
