const API_URL = import.meta.env.VITE_API_URL;

export const cityService = {
    getAll: async (onlyActive = false, country = null) => {
        try {
            const params = new URLSearchParams();
            if (onlyActive) params.append('onlyActiveOffers', 'true');
            if (country) params.append('country', country);

            const url = `${API_URL}/Cities?${params.toString()}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch cities');
            return await response.json();
        } catch (error) {
            console.error('Error fetching cities:', error);
            // Fallback could be handled here or in component
            return [];
        }
    }
};
