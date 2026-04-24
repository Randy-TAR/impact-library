import React, { useState } from 'react';
import { borrowService } from '../../services/borrowService';
import { useNotification } from '../../hooks/useNotification';
import { format } from 'date-fns';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';

const BorrowList = ({ records, onReturn }) => {
  const [returning, setReturning] = useState(null);
  const { showSuccess, showError } = useNotification();

  const handleReturn = async (recordId) => {
    setReturning(recordId);
    try {
      await borrowService.returnBook(recordId);
      showSuccess('Book returned successfully!');
      if (onReturn) onReturn();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to return book');
    } finally {
      setReturning(null);
    }
  };

  const getStatusBadge = (status, dueDate) => {
    if (status === 'returned') {
      return (
        <Badge bg="success" pill className="d-inline-flex align-items-center gap-1">
          <CheckCircle size={12} />
          <span>Returned</span>
        </Badge>
      );
    }
    
    const isOverdue = new Date(dueDate) < new Date();
    if (isOverdue) {
      return (
        <Badge bg="danger" pill className="d-inline-flex align-items-center gap-1">
          <AlertCircle size={12} />
          <span>Overdue</span>
        </Badge>
      );
    }
    
    return (
      <Badge bg="warning" pill className="d-inline-flex align-items-center gap-1">
        <Clock size={12} />
        <span>Borrowed</span>
      </Badge>
    );
  };

  if (records.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        <p className="mb-0">No borrow records found.</p>
      </Alert>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped hover className="align-middle">
        <thead className="bg-light">
          <tr>
            <th className="py-3">Borrower</th>
            <th className="py-3">Book</th>
            <th className="py-3">Borrow Date</th>
            <th className="py-3">Due Date</th>
            <th className="py-3">Status</th>
            <th className="py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>
                <div className="fw-semibold">{record.borrower_name}</div>
                <div className="small text-muted">{record.borrower_contact}</div>
              </td>
              <td>
                <div>{record.book_title}</div>
                <div className="small text-muted">ID: {record.book_id}</div>
              </td>
              <td className="text-muted">
                {format(new Date(record.borrow_date), 'MMM dd, yyyy')}
              </td>
              <td className="text-muted">
                {format(new Date(record.due_date), 'MMM dd, yyyy')}
              </td>
              <td>
                {getStatusBadge(record.status, record.due_date)}
              </td>
              <td>
                {record.status === 'borrowed' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleReturn(record.id)}
                    disabled={returning === record.id}
                  >
                    {returning === record.id ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        <span className="ms-2">Processing...</span>
                      </>
                    ) : (
                      'Return'
                    )}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default BorrowList;