import React, { useState, useEffect } from 'react';
import { borrowService } from '../services/borrowService';
import BorrowList from '../components/Borrowing/BorrowList';
import Loader from '../components/Common/Loader';
import BookUpload from '../components/Books/BookUpload';
import Modal from '../components/Common/Modal';
import { useAuth } from '../hooks/useAuth';
import { Plus, BookOpen } from 'lucide-react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

const BorrowingPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { hasRole } = useAuth();

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const data = await borrowService.getAllBorrowRecords();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="py-4">
      <Container fluid>
        {/* Header Section */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="display-6 fw-bold text-dark mb-2">
                  Borrowing Management
                </h1>
                <p className="text-muted mb-0">
                  Track and manage book borrowings
                </p>
              </div>
              <div>
                {hasRole(['librarian', 'admin']) && (
                  <Button
                    variant="primary"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="d-flex align-items-center gap-2 px-4 py-2"
                  >
                    <Plus size={18} />
                    <span>Add New Book</span>
                  </Button>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* Statistics Cards - Optional */}
        <Row className="mb-4">
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Total Borrowings</p>
                    <h3 className="fw-bold mb-0">{records.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <BookOpen size={24} className="text-primary" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Active Borrowings</p>
                    <h3 className="fw-bold mb-0">
                      {records.filter(r => r.status === 'borrowed').length}
                    </h3>
                  </div>
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <BookOpen size={24} className="text-success" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Returned Books</p>
                    <h3 className="fw-bold mb-0">
                      {records.filter(r => r.status === 'returned').length}
                    </h3>
                  </div>
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <BookOpen size={24} className="text-info" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Overdue Books</p>
                    <h3 className="fw-bold mb-0">
                      {records.filter(r => {
                        if (r.status !== 'borrowed') return false;
                        return new Date(r.due_date) < new Date();
                      }).length}
                    </h3>
                  </div>
                  <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                    <BookOpen size={24} className="text-danger" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Borrow List Section */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 pb-0">
                <h5 className="fw-semibold mb-0">Borrowing Records</h5>
              </Card.Header>
              <Card.Body>
                <BorrowList records={records} onReturn={fetchRecords} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modal for Uploading Books */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title="Upload New Book"
          size="lg"
          showFooter={false}
        >
          <BookUpload onSuccess={() => {
            setIsUploadModalOpen(false);
            fetchRecords();
          }} />
        </Modal>
      </Container>
    </div>
  );
};

export default BorrowingPage;