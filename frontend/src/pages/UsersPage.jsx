import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import Loader from '../components/Common/Loader';
import Modal from '../components/Common/Modal';
import Register from '../components/Auth/Register';
import { useNotification } from '../hooks/useNotification';
import { Plus, User, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Container, Row, Col, Button, Card, Badge, Table } from 'react-bootstrap';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (error) {
      showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'librarian':
        return 'primary';
      default:
        return 'success';
    }
  };

  const getRoleIconColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-danger';
      case 'librarian':
        return 'text-primary';
      default:
        return 'text-success';
    }
  };

  const handleRegisterSuccess = () => {
    setIsRegisterModalOpen(false);
    fetchUsers();
    showSuccess('User registered and list updated!');
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    librarians: users.filter(u => u.role === 'librarian').length,
    users: users.filter(u => u.role === 'user').length
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
                  User Management
                </h1>
                <p className="text-muted mb-0">
                  Manage library users and their roles
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsRegisterModalOpen(true)}
                className="d-flex align-items-center gap-2 px-4 py-2"
              >
                <Plus size={18} />
                <span>Add New User</span>
              </Button>
            </div>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row className="mb-4 g-3">
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Total Users</p>
                    <h3 className="fw-bold mb-0 text-primary">{stats.total}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <User size={24} className="text-primary" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Administrators</p>
                    <h3 className="fw-bold mb-0 text-danger">{stats.admins}</h3>
                  </div>
                  <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                    <Briefcase size={24} className="text-danger" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Librarians</p>
                    <h3 className="fw-bold mb-0 text-primary">{stats.librarians}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <Briefcase size={24} className="text-primary" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted small mb-1">Regular Users</p>
                    <h3 className="fw-bold mb-0 text-success">{stats.users}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <User size={24} className="text-success" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Search Bar */}
        <Row className="mb-4">
          <Col md={6} lg={5}>
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-white border-end-0">
                🔍
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
          </Col>
        </Row>

        {/* Users Table/Cards */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Joined</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-5">
                            <div className="text-muted">
                              <User size={48} className="mx-auto mb-3 opacity-25" />
                              <p>No users found</p>
                              {searchTerm && (
                                <Button
                                  variant="link"
                                  onClick={() => setSearchTerm('')}
                                  className="mt-2"
                                >
                                  Clear search
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="border-bottom">
                            <td className="py-3 px-4">
                              <div className="d-flex align-items-center gap-3">
                                <div className={`bg-${getRoleBadgeVariant(user.role)} bg-opacity-10 rounded-circle p-2`}>
                                  <User size={20} className={`text-${getRoleBadgeVariant(user.role)}`} />
                                </div>
                                <div>
                                  <h6 className="fw-semibold mb-0">{user.name}</h6>
                                  <small className="text-muted">{user.email}</small>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="d-flex align-items-center gap-2">
                                <Phone size={14} className="text-muted" />
                                <span className="small">{user.contact || 'Not provided'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="d-flex align-items-center gap-2">
                                <Calendar size={14} className="text-muted" />
                                <span className="small">
                                  {format(new Date(user.created_at), 'MMM dd, yyyy')}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                bg={getRoleBadgeVariant(user.role)}
                                className="px-3 py-2 rounded-pill"
                              >
                                <Briefcase size={12} className="me-1" />
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-pill px-3"
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modal for Registering Users */}
        <Modal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          title="Register New User"
          size="lg"
        >
          <Register onSuccess={handleRegisterSuccess} />
        </Modal>
      </Container>
    </div>
  );
};

export default UsersPage;