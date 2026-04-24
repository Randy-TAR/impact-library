import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Calendar, User, BookOpen, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { bookService } from '../../services/bookService';
import { useNotification } from '../../hooks/useNotification';
import { Card, Button, Badge } from 'react-bootstrap';

const BookCard = ({ book, onDownload, onEdit }) => {
  const { hasRole } = useAuth();
  const { showSuccess, showError } = useNotification();

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await bookService.downloadBook(book.id, book.title);
      showSuccess('Download started!');
      if (onDownload) onDownload(book.id);
    } catch (error) {
      showError('Failed to download book');
    }
  };

  return (
    <Card className="h-100 shadow-sm hover-shadow">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="bg-primary bg-gradient p-3 rounded-circle">
            <BookOpen size={24} color="white" />
          </div>
          <Badge bg="secondary" pill>{book.format || 'PDF'}</Badge>
        </div>
        
        <Link to={`/books/${book.id}`} className="text-decoration-none">
          <h5 className="fw-bold text-dark mb-2">{book.title}</h5>
        </Link>
        
        <div className="mb-3">
          <div className="d-flex align-items-center text-muted small mb-1">
            <User size={14} className="me-2" />
            <span>{book.author}</span>
          </div>
          <div className="d-flex align-items-center text-muted small">
            <Calendar size={14} className="me-2" />
            <span>Added: {format(new Date(book.uploaded_at), 'MMM dd, yyyy')}</span>
          </div>
          <div className="d-flex align-items-center text-muted small mt-1">
            <span className="fw-semibold me-1">Available:</span>
            <span className={book.available_count > 0 ? 'text-success' : 'text-danger'}>
              {book.available_count || 0} copies
            </span>
          </div>
        </div>
        
        <hr className="my-3" />
        
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3">
            <div className="d-flex align-items-center text-muted small">
              <Download size={14} className="me-1" />
              <span>{book.download_count || 0}</span>
            </div>
            <div className="d-flex align-items-center text-muted small">
              <Eye size={14} className="me-1" />
              <span>{book.view_count || 0}</span>
            </div>
          </div>
          
          <div className="d-flex gap-2">
            {hasRole(['librarian', 'admin']) && (
              <Button variant="outline-warning" size="sm" onClick={() => onEdit?.(book)}>
                <Edit size={14} />
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleDownload}>
              <Download size={16} />
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookCard;