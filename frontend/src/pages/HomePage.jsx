import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/bookService';
import BookCard from '../components/Books/BookCard';
import BookSearch from '../components/Books/BookSearch';
import { ArrowRight, Library, Users, Award, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';

const HomePage = () => {
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [stats, setStats] = useState({ total: 0, categories: 0, downloads: 0 });

  useEffect(() => {
    fetchRecentBooks();
    fetchStats();
  }, []);

  const fetchRecentBooks = async () => {
    try {
      const books = await bookService.getAllBooks();
      setRecentBooks(books.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const books = await bookService.getAllBooks();
      const categories = [...new Set(books.map(b => b.category).filter(Boolean))];
      const totalDownloads = books.reduce((sum, b) => sum + (b.download_count || 0), 0);
      setStats({
        total: books.length,
        categories: categories.length,
        downloads: totalDownloads
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSearch = async (keyword) => {
    if (!keyword) {
      setSearchResults(null);
      return;
    }
    setLoading(true);
    try {
      const results = await bookService.searchBooks(keyword);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Library, title: 'Vast Collection', description: 'Access thousands of books across multiple categories', color: 'primary' },
    { icon: Users, title: 'Community Driven', description: 'Join a growing community of knowledge seekers', color: 'success' },
    { icon: Award, title: 'Quality Content', description: 'Curated and verified educational materials', color: 'warning' },
  ];

  return (
    <div className="py-4">
      <Container fluid>
        {/* Hero Section */}
        <Row className="mb-5">
          <Col>
            <div className="bg-primary bg-gradient rounded-4 p-5 p-md-8 text-white text-center position-relative overflow-hidden">
              <div className="position-relative" style={{ zIndex: 2 }}>
                <h1 className="display-3 fw-bold mb-4">
                  Welcome to Impact Library
                </h1>
                <p className="fs-4 mb-4 opacity-90">
                  Discover, learn, and grow with our vast collection of knowledge
                </p>
                <div className="mx-auto" style={{ maxWidth: '600px' }}>
                  <BookSearch onSearch={handleSearch} isLoading={loading} />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10">
                <div className="position-absolute" style={{ top: '10%', left: '5%' }}>📖</div>
                <div className="position-absolute" style={{ bottom: '15%', right: '8%' }}>📚</div>
                <div className="position-absolute" style={{ top: '30%', right: '15%' }}>⭐</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats Section */}
        <Row className="mb-5 g-3">
          <Col xs={12} md={4}>
            <Card className="border-0 shadow-sm text-center h-100">
              <Card.Body className="p-4">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                  <BookOpen size={32} className="text-primary" />
                </div>
                <h2 className="display-4 fw-bold text-primary mb-1">{stats.total}+</h2>
                <p className="text-muted mb-0">Books Available</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card className="border-0 shadow-sm text-center h-100">
              <Card.Body className="p-4">
                <div className="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                  <TrendingUp size={32} className="text-success" />
                </div>
                <h2 className="display-4 fw-bold text-success mb-1">{stats.categories}+</h2>
                <p className="text-muted mb-0">Categories</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card className="border-0 shadow-sm text-center h-100">
              <Card.Body className="p-4">
                <div className="bg-info bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                  <Clock size={32} className="text-info" />
                </div>
                <h2 className="display-4 fw-bold text-info mb-1">{stats.downloads.toLocaleString()}+</h2>
                <p className="text-muted mb-0">Total Downloads</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Features Section */}
        <Row className="mb-5">
          <Col>
            <h2 className="text-center display-6 fw-bold mb-4">Why Choose Us?</h2>
            <p className="text-center text-muted mb-5">We provide the best library experience</p>
            <Row className="g-4">
              {features.map((feature, index) => (
                <Col key={index} xs={12} md={4}>
                  <Card className="border-0 shadow-sm h-100 text-center hover-lift">
                    <Card.Body className="p-4">
                      <div className={`bg-${feature.color} bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3`}>
                        <feature.icon size={40} className={`text-${feature.color}`} />
                      </div>
                      <h5 className="fw-bold mb-2">{feature.title}</h5>
                      <p className="text-muted mb-0">{feature.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Recent Books Section */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <div>
                <h2 className="display-6 fw-bold mb-1">Recent Additions</h2>
                <p className="text-muted mb-0">Check out our latest arrivals</p>
              </div>
              <Button 
                as={Link} 
                to="/books" 
                variant="outline-primary"
                className="rounded-pill px-4 d-flex align-items-center gap-2"
              >
                View All Books <ArrowRight size={16} />
              </Button>
            </div>
          </Col>
        </Row>

        {searchResults ? (
          <Row>
            <Col>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-semibold mb-0">
                  Search Results ({searchResults.length})
                </h4>
                <Button 
                  variant="link" 
                  onClick={() => setSearchResults(null)}
                  className="text-decoration-none"
                >
                  Clear Search
                </Button>
              </div>
              <Row className="g-4">
                {searchResults.map((book) => (
                  <Col key={book.id} xs={12} sm={6} lg={4}>
                    <BookCard book={book} />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        ) : (
          <Row className="g-4">
            {recentBooks.length === 0 ? (
              <Col>
                <div className="text-center py-5">
                  <BookOpen size={64} className="text-muted mb-3 opacity-25" />
                  <h5 className="text-muted">No books available yet</h5>
                  <p className="text-muted small">Check back later for new additions</p>
                </div>
              </Col>
            ) : (
              recentBooks.map((book) => (
                <Col key={book.id} xs={12} sm={6} lg={4}>
                  <BookCard book={book} />
                </Col>
              ))
            )}
          </Row>
        )}

        {/* Call to Action Section */}
        {!searchResults && recentBooks.length > 0 && (
          <Row className="mt-5">
            <Col>
              <div className="bg-light rounded-4 p-5 text-center">
                <h3 className="fw-bold mb-3">Ready to start your journey?</h3>
                <p className="text-muted mb-4">
                  Join our community of readers and explore thousands of books
                </p>
                <Button 
                  as={Link} 
                  to="/books" 
                  variant="primary" 
                  size="lg"
                  className="rounded-pill px-5"
                >
                  Browse All Books
                </Button>
              </div>
            </Col>
          </Row>
        )}
      </Container>

      {/* Custom CSS for hover effects */}
      <style jsx>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.1) !important;
        }
        @media (min-width: 768px) {
          .p-md-8 {
            padding: 4rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;