import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useNotification } from '../../hooks/useNotification';
import { User, Mail, Lock, Phone, Briefcase } from 'lucide-react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

const Register = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register(formData);
      showSuccess('User registered successfully!');
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      } else {
        setTimeout(() => navigate('/users'), 1500);
      }
    } catch (error) {
      showError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="bg-primary bg-gradient rounded-circle p-3 d-inline-flex mb-3 shadow-sm">
                  <User size={32} color="white" />
                </div>
                <h2 className="fw-bold text-dark mb-2">Register New User</h2>
                <p className="text-muted">Create a new library account</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Full Name</Form.Label>
                  <div className="position-relative">
                    <User className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="py-2 ps-5"
                      placeholder="John Doe"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Email</Form.Label>
                  <div className="position-relative">
                    <Mail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="py-2 ps-5"
                      placeholder="john@example.com"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <div className="position-relative">
                    <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="py-2 ps-5"
                      placeholder="••••••••"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Contact Number</Form.Label>
                  <div className="position-relative">
                    <Phone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                    <Form.Control
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      required
                      className="py-2 ps-5"
                      placeholder="+1234567890"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Role</Form.Label>
                  <div className="position-relative">
                    <Briefcase className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                    <Form.Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="py-2 ps-5"
                    >
                      <option value="user">User</option>
                      <option value="librarian">Librarian</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-100 py-2 fw-semibold"
                >
                  {loading ? 'Registering...' : 'Register User'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;