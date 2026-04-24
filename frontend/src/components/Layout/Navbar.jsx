import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, User, LogOut, Menu, X, LayoutDashboard, BookMarked, Users } from 'lucide-react';
import { Navbar as BootstrapNavbar, Container, Nav, Button, Dropdown, NavDropdown } from 'react-bootstrap';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setExpanded(false);
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: BookOpen },
    { to: '/books', label: 'Books', icon: BookMarked },
  ];

  if (user && (user.role === 'admin' || user.role === 'librarian')) {
    navLinks.push({ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
    navLinks.push({ to: '/borrowing', label: 'Borrowing', icon: Users });
  }

  if (user && user.role === 'admin') {
    navLinks.push({ to: '/users', label: 'Users', icon: Users });
  }

  return (
    <BootstrapNavbar bg="white" expand="md" className="shadow-sm sticky-top" expanded={expanded} onToggle={setExpanded}>
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <div className="bg-primary bg-gradient rounded-circle p-2 d-inline-flex">
            <BookOpen size={24} color="white" />
          </div>
          <span className="fw-bold fs-4 bg-gradient-text">
            Impact Library
          </span>
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="navbar-nav" onClick={() => setExpanded(!expanded)}>
          {expanded ? <X size={24} /> : <Menu size={24} />}
        </BootstrapNavbar.Toggle>
        
        <BootstrapNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center gap-3">
            {navLinks.map((link) => (
              <Nav.Link 
                key={link.to} 
                as={Link} 
                to={link.to}
                onClick={() => setExpanded(false)}
                className="d-flex align-items-center gap-2 text-dark"
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Nav.Link>
            ))}
            
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle as={Button} variant="link" className="d-flex align-items-center gap-2 text-dark text-decoration-none p-0">
                  <div className="bg-primary bg-gradient rounded-circle p-2 d-inline-flex">
                    <User size={16} color="white" />
                  </div>
                  <span className="fw-medium">{user.name} ({user.role})</span>
                </Dropdown.Toggle>
                
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <LogOut size={16} className="me-2" />
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button 
                as={Link} 
                to="/login" 
                variant="primary"
                className="rounded-pill px-4"
                onClick={() => setExpanded(false)}
              >
                Login
              </Button>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;