import React, { useState } from 'react';
import { Download, Calendar, User, BookOpen, FileText, TrendingUp, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { bookService } from '../../services/bookService';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { Button, Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import Modal from '../Common/Modal';
import BorrowForm from '../Borrowing/BorrowForm';
import BookUpload from './BookUpload';

const BookDetails = ({ book, onBack, onDelete }) => {
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { showSuccess, showError } = useNotification();
  const { hasRole } = useAuth();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await bookService.downloadBook(book.id, book.title);
      showSuccess('Download started!');
    } catch (error) {
      showError('Failed to download book');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await bookService.deleteBook(book.id);
      showSuccess('Book deleted successfully!');
      setIsDeleteModalOpen(false);
      if (onDelete) onDelete();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to delete book');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    showSuccess('Book updated successfully!');
    if (onBack) onBack();
  };

  return (
    <>
      <Button
        variant="link"
        onClick={onBack}
        className="text-decoration-none mb-4 d-inline-flex align-items-center gap-2"
      >
        <ArrowLeft size={20} />
        <span>Back to Books</span>
      </Button>

      <Card className="shadow-lg border-0 overflow-hidden">
        <Row className="g-0">
          {/* Book Cover Placeholder */}
          <Col md={4} className="bg-primary bg-gradient p-5 d-flex align-items-center justify-content-center">
            <div className="text-center text-white">
              <BookOpen size={128} className="mx-auto mb-3" />
              <Badge bg="light" text="dark" className="mt-2">PDF Document</Badge>
              {book.available_count !== undefined && (
                <Badge bg={book.available_count > 0 ? 'success' : 'danger'} className="mt-2 ms-2">
                  {book.available_count > 0 ? `${book.available_count} copies available` : 'Out of stock'}
                </Badge>
              )}
            </div>
          </Col>

          {/* Book Info */}
          <Col md={8}>
            <Card.Body className="p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <h1 className="display-6 fw-bold mb-0">{book.title}</h1>
                {hasRole(['librarian', 'admin']) && (
                  <div className="d-flex gap-2">
                    <Button variant="outline-warning" size="sm" onClick={() => setIsEditModalOpen(true)}>
                      <Edit size={16} className="me-1" /> Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                      <Trash2 size={16} className="me-1" /> Delete
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <div className="d-flex align-items-center mb-2">
                  <User size={18} className="text-primary me-2" />
                  <strong className="me-2">Author:</strong>
                  <span>{book.author}</span>
                </div>
                
                <div className="d-flex align-items-center mb-2">
                  <BookOpen size={18} className="text-primary me-2" />
                  <strong className="me-2">Category:</strong>
                  <span>{book.category}</span>
                </div>
                
                <div className="d-flex align-items-center mb-2">
                  <FileText size={18} className="text-primary me-2" />
                  <strong className="me-2">Format:</strong>
                  <span>{book.format || 'PDF'}</span>
                </div>
                
                <div className="d-flex align-items-center mb-2">
                  <Calendar size={18} className="text-primary me-2" />
                  <strong className="me-2">Uploaded:</strong>
                  <span>{format(new Date(book.uploaded_at), 'MMMM dd, yyyy')}</span>
                </div>
                
                <div className="d-flex align-items-center mb-2">
                  <TrendingUp size={18} className="text-primary me-2" />
                  <strong className="me-2">Downloads:</strong>
                  <span>{book.download_count || 0} times</span>
                </div>
                
                {book.available_count !== undefined && (
                  <div className="d-flex align-items-center mb-2">
                    <strong className="me-2">Available Copies:</strong>
                    <span className={book.available_count > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                      {book.available_count || 0}
                    </span>
                  </div>
                )}
              </div>

              {book.description && (
                <div className="mb-4">
                  <h5 className="fw-bold mb-2">Description</h5>
                  <p className="text-muted">{book.description}</p>
                </div>
              )}

              <div className="d-flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                >
                  <Download size={20} />
                  <span>{downloading ? 'Downloading...' : 'Download Book'}</span>
                </Button>
                
                {hasRole(['librarian', 'admin']) && book.available_count > 0 && (
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => setIsBorrowModalOpen(true)}
                    className="flex-grow-1"
                  >
                    Issue Book
                  </Button>
                )}
                {hasRole(['librarian', 'admin']) && book.available_count === 0 && (
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled
                    className="flex-grow-1"
                  >
                    No Copies Available
                  </Button>
                )}
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>

      {/* Borrow Modal */}
      <Modal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        title="Issue Book"
      >
        <BorrowForm
          book={book}
          onSuccess={() => {
            setIsBorrowModalOpen(false);
            showSuccess('Book issued successfully!');
            if (onBack) onBack();
          }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Book: ${book.title}`}
        size="lg"
      >
        <BookUpload
          onSuccess={handleEditSuccess}
          initialData={book}
          isEdit={true}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="md"
      >
        <Alert variant="danger">
          <Alert.Heading>Are you sure?</Alert.Heading>
          <p>
            You are about to delete <strong>"{book.title}"</strong> by <strong>{book.author}</strong>.
            This action cannot be undone and will also delete the PDF file from the server.
          </p>
          <hr />
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Yes, Delete Book'}
            </Button>
          </div>
        </Alert>
      </Modal>
    </>
  );
};

export default BookDetails;