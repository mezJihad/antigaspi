import api from './api';

export const registerSeller = async (token, sellerData) => {
    // Note: api.js interceptor adds the token from localStorage automatically.
    // If the token passed here is different from localStorage, we might need to override headers.
    // Assuming standard flow where token is in localStorage.
    try {
        const response = await api.post('/Sellers', sellerData);
        return response.data;
    } catch (error) {
        let errorMessage = 'Seller registration failed';
        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data);
        }
        throw new Error(errorMessage);
    }
};

export const getMe = async (token) => {
    try {
        const response = await api.get('/Sellers/me');
        return response.data;
    } catch (error) {
        return null;
    }
}
