import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/Auth/PrivateRoute';
import HomePage from './pages/HomePage';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import DashboardPage from './pages/DashboardPage';
import BorrowingPage from './pages/BorrowingPage';
import UsersPage from './pages/UsersPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={
              <PrivateRoute allowedRoles={['admin']}>
                <Register />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute allowedRoles={['admin', 'librarian']}>
                <DashboardPage />
              </PrivateRoute>
            } />
            <Route path="/borrowing" element={
              <PrivateRoute allowedRoles={['admin', 'librarian']}>
                <BorrowingPage />
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute allowedRoles={['admin']}>
                <UsersPage />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;