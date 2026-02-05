const API_URL = import.meta.env.VITE_API_URL;

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.title || JSON.stringify(errorData);
        } catch (e) { }
        throw new Error(errorMessage);
    }
    return response.json();
};

export const register = async (firstName, lastName, email, password, role, language) => {
    const response = await fetch(`${API_URL}/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, role, language }),
    });
    if (!response.ok) {
        let errorMessage = 'Registration failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.title || JSON.stringify(errorData);
        } catch (e) { }
        throw new Error(errorMessage);
    }
    return response.json();
};

export const verifyEmail = async (email, otp) => {
    const response = await fetch(`${API_URL}/Auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    });
    if (!response.ok) {
        let errorMessage = 'Verification failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.title || JSON.stringify(errorData);
        } catch (e) { }
        throw new Error(errorMessage);
    }
    // Returns 204 typically
    return true;
};

export const resendVerification = async (email) => {
    const response = await fetch(`${API_URL}/Auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) {
        const error = new Error('Resend failed');
        error.response = response;
        throw error;
    }
    return response.json();
};

export const forgotPassword = async (email) => {
    const response = await fetch(`${API_URL}/Auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    // Always return true/success for security (no user enumeration) unless 500
    if (response.status >= 500) throw new Error('Server error');
    return true;
};

export const resetPassword = async (email, token, newPassword) => {
    const response = await fetch(`${API_URL}/Auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
    });
    if (!response.ok) {
        let errorMessage = 'Reset failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || 'Erreur lors de la réinitialisation.';
        } catch (e) { }
        throw new Error(errorMessage);
    }
    return true;
};
