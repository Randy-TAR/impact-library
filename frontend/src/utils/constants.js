export const API_ENDPOINTS = {
  BOOKS: '/books',
  BORROWS: '/borrows',
  USERS: '/users',
  DASHBOARD: '/dashboard',
  SEARCH: '/books/search',
  DOWNLOAD: '/books/download',
};

export const ROLES = {
  ADMIN: 'admin',
  LIBRARIAN: 'librarian',
  USER: 'user',
};

export const BOOK_CATEGORIES = [
  'Fiction', 'Non-Fiction', 'Science', 'Technology', 
  'History', 'Biography', 'Children', 'Education',
  'Business', 'Health', 'Art', 'Religion'
];

export const DEFAULT_BORROW_DAYS = 14;

export const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB