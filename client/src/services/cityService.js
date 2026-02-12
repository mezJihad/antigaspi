import api from './api';

export const cityService = {
    getAll: async (onlyActive = false, country = null) => {
        try {
            const params = {};
            if (onlyActive) params.onlyActiveOffers = 'true';
            if (country) params.country = country;

            const response = await api.get('/Cities', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching cities:', error);
            // Fallback could be handled here or in component
            return [];
        }
    }
};
