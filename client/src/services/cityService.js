const API_URL = import.meta.env.VITE_API_URL;

export const cityService = {
    getAll: async () => {
        try {
            const response = await fetch(`${API_URL}/Cities`);
            if (!response.ok) throw new Error('Failed to fetch cities');
            return await response.json();
        } catch (error) {
            console.error('Error fetching cities:', error);
            // Fallback could be handled here or in component
            return [];
        }
    }
};
