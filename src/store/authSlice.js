import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user:         JSON.parse(localStorage.getItem('user')) || null,
    access_token: localStorage.getItem('access_token')    || null,
    isAuthenticated: !!localStorage.getItem('access_token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user            = action.payload.user;
            state.access_token    = action.payload.access;
            state.isAuthenticated = true;
            localStorage.setItem('access_token',  action.payload.access);
            localStorage.setItem('refresh_token', action.payload.refresh);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
        },
        logout: (state) => {
            state.user            = null;
            state.access_token    = null;
            state.isAuthenticated = false;
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;