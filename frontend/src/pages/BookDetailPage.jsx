import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { bookService } from '../services/bookService';
import BookDetails from '../components/Books/BookDetails';
import Loader from '../components/Common/Loader';
import { useNotification } from '../hooks/useNotification';

const BookDetailPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useNotification();

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const data = await bookService.getBookById(id);
      setBook(data);
    } catch (error) {
      showError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!book) return <div className="text-center py-12">Book not found</div>;

  return <BookDetails book={book} onBack={() => window.history.back()} />;
};

export default BookDetailPage;