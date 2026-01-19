const API_URL = 'http://localhost:5131/api';

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
};

export const register = async (email, password, role) => {
    const response = await fetch(`${API_URL}/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
};
