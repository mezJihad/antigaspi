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

export const register = async (firstName, lastName, email, password, role) => {
    const response = await fetch(`${API_URL}/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, role }),
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
        throw new Error('Resend failed');
    }
    return response.json();
};
