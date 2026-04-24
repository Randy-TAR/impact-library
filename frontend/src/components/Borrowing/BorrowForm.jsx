import React, { useState } from 'react';
import { borrowService } from '../../services/borrowService';
import { useNotification } from '../../hooks/useNotification';
import { Calendar, User, Phone } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';

const BorrowForm = ({ book, onSuccess }) => {
  const [formData, setFormData] = useState({
    book_id: book.id,
    borrower_name: '',
    borrower_contact: '',
    borrow_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
  });
  const [loading, setLoading] = useState(false);
  const { showError } = useNotification();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await borrowService.createBorrowRecord(formData);
      onSuccess();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Card className="bg-light mb-4 border-0">
        <Card.Body>
          <h6 className="fw-bold mb-2">Book: {book.title}</h6>
          <p className="text-muted small mb-0">by {book.author}</p>
        </Card.Body>
      </Card>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Borrower Name *</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <User size={18} />
          </InputGroup.Text>
          <Form.Control
            type="text"
            name="borrower_name"
            value={formData.borrower_name}
            onChange={handleChange}
            required
            placeholder="Enter borrower's full name"
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Contact Number *</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Phone size={18} />
          </InputGroup.Text>
          <Form.Control
            type="tel"
            name="borrower_contact"
            value={formData.borrower_contact}
            onChange={handleChange}
            required
            placeholder="Enter contact number"
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Borrow Date *</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Calendar size={18} />
          </InputGroup.Text>
          <Form.Control
            type="date"
            name="borrow_date"
            value={formData.borrow_date}
            onChange={handleChange}
            required
          />
        </InputGroup>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Due Date *</Form.Label>
        <InputGroup>
          <InputGroup.Text>
            <Calendar size={18} />
          </InputGroup.Text>
          <Form.Control
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            required
          />
        </InputGroup>
      </Form.Group>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading}
        className="w-100"
      >
        {loading ? 'Issuing...' : 'Issue Book'}
      </Button>
    </Form>
  );
};

export default BorrowForm;