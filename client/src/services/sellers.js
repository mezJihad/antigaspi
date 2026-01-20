const API_URL = 'http://localhost:5131/api';

export const registerSeller = async (token, sellerData) => {
    const response = await fetch(`${API_URL}/Sellers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sellerData)
    });
    if (!response.ok) {
        let errorMessage = 'Seller registration failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.title || JSON.stringify(errorData);
        } catch (e) { }
        throw new Error(errorMessage);
    }
    return response.json();
};

export const getMe = async (token) => {
    const response = await fetch(`${API_URL}/Sellers/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) return null;
    return response.json();
}
