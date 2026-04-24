import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Container } from 'react-bootstrap';

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      <main className="flex-grow-1 py-4">
        <Container>
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;