import api from './api';

export const login = async (email, password) => {
    try {
        const response = await api.post('/Auth/login', { email, password });
        return response.data;
    } catch (error) {
        let errorMessage = 'Login failed';
        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data);
        }
        throw new Error(errorMessage);
    }
};

export const register = async (firstName, lastName, email, password, role, language) => {
    try {
        const response = await api.post('/Auth/register', { firstName, lastName, email, password, role, language });
        return response.data;
    } catch (error) {
        let errorMessage = 'Registration failed';
        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data);
        }
        throw new Error(errorMessage);
    }
};

export const verifyEmail = async (email, otp) => {
    try {
        const response = await api.post('/Auth/verify', { email, otp });
        return true;
    } catch (error) {
        let errorMessage = 'Verification failed';
        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || error.response.data.title || JSON.stringify(error.response.data);
        }
        throw new Error(errorMessage);
    }
};

export const resendVerification = async (email) => {
    try {
        const response = await api.post('/Auth/resend-verification', { email });
        return response.data;
    } catch (error) {
        throw new Error('Resend failed');
    }
};

export const forgotPassword = async (email) => {
    try {
        await api.post('/Auth/forgot-password', { email });
        return true;
    } catch (error) {
        if (error.response && error.response.status >= 500) throw new Error('Server error');
        // For security, behave as success for 404 or other errors to avoid enumeration, unless it's a server error
        return true;
    }
};

export const resetPassword = async (email, token, newPassword) => {
    try {
        const response = await api.post('/Auth/reset-password', { email, token, newPassword });
        return true;
    } catch (error) {
        let errorMessage = 'Reset failed';
        if (error.response && error.response.data) {
            errorMessage = error.response.data.message || 'Erreur lors de la réinitialisation.';
        }
        throw new Error(errorMessage);
    }
};
