import React from 'react';
import { format } from 'date-fns';
import { Calendar, Download, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';

const RecentUploads = ({ uploads }) => {
  if (uploads.length === 0) {
    return (
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="fw-semibold mb-4">Recent Uploads</Card.Title>
          <p className="text-muted text-center py-4">No recent uploads</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="fw-semibold mb-4">Recent Uploads</Card.Title>
        <div className="d-flex flex-column gap-3">
          {uploads.map((book) => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className="text-decoration-none"
            >
              <div className="border rounded-3 p-3 hover-shadow transition-all bg-white">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h6 className="fw-semibold text-dark mb-1">{book.title}</h6>
                    <p className="text-muted small mb-2">{book.author}</p>
                    <div className="d-flex gap-3">
                      <div className="d-flex align-items-center text-muted small">
                        <Calendar size={12} className="me-1" />
                        {format(new Date(book.uploaded_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="d-flex align-items-center text-muted small">
                        <Download size={12} className="me-1" />
                        {book.download_count || 0} downloads
                      </div>
                    </div>
                  </div>
                  <Badge bg="primary" pill className="ms-3">
                    {book.category}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default RecentUploads;