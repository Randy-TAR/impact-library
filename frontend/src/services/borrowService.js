import api from './api';

export const borrowService = {
  async getAllBorrowRecords() {
    const response = await api.get('/borrows');
    return response.data;
  },

  async createBorrowRecord(borrowData) {
    const response = await api.post('/borrows', borrowData);
    return response.data;
  },

  async returnBook(recordId) {
    const response = await api.put(`/borrows/${recordId}/return`);
    return response.data;
  },
};