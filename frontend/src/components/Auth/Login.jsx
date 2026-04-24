import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      showError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0 rounded-4 animate__animated animate__fadeIn">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="bg-primary bg-gradient rounded-circle p-3 d-inline-flex mb-3 shadow-sm">
                  <LogIn size={32} color="white" />
                </div>
                <h2 className="fw-bold text-dark mb-2">Welcome Back</h2>
                <p className="text-muted">Sign in to access the library</p>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Email Address</Form.Label>
                  <div className="position-relative">
                    <Mail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="py-2 ps-5"
                      placeholder="you@example.com"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <div className="position-relative">
                    <Lock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="py-2 ps-5"
                      placeholder="••••••••"
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-100 py-2 fw-semibold mb-3 center d-flex align-items-center justify-content-center"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form>

              <div className="text-center mt-4 pt-2 border-top">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                  Register
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;