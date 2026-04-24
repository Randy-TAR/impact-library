import api from './api';

export const dashboardService = {
  async getStatistics() {
    const response = await api.get('/dashboard');
    return response.data;
  },
};