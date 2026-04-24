import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto py-4">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
              <div className="bg-primary bg-gradient rounded-circle p-2 d-inline-flex">
                <BookOpen size={20} color="white" />
              </div>
              <span className="fw-semibold text-dark fs-5">Impact Library</span>
            </div>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="d-flex align-items-center justify-content-center justify-content-md-end gap-1 text-muted small">
              <span>Made with</span>
              <Heart size={14} className="text-danger" fill="#dc3545" />
              <span>© 2026 Impact Library. All rights reserved.</span>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;