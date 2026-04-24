import React, { useState, useEffect } from 'react';
import { bookService } from '../services/bookService';
import BookCard from '../components/Books/BookCard';
import BookSearch from '../components/Books/BookSearch';
import Loader from '../components/Common/Loader';
import Modal from '../components/Common/Modal';
import BookUpload from '../components/Books/BookUpload';
import { useNotification } from '../hooks/useNotification';
import { Filter } from 'lucide-react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const { showSuccess } = useNotification();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const data = await bookService.getAllBooks();
      setBooks(data);
      setFilteredBooks(data);
      
      const uniqueCategories = ['All', ...new Set(data.map(book => book.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword) => {
    if (!keyword) {
      filterByCategory(selectedCategory);
      return;
    }
    setLoading(true);
    try {
      const results = await bookService.searchBooks(keyword);
      setFilteredBooks(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(books.filter(book => book.category === category));
    }
  };

  // Handle edit button click
  const handleEditClick = (book) => {
    setSelectedBook(book);
    setEditModalOpen(true);
  };

  // Handle successful edit
  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setSelectedBook(null);
    fetchBooks(); // Refresh the book list
    showSuccess('Book updated successfully!');
  };

  if (loading) return <Loader />;

  const totalBooks = filteredBooks.length;
  const totalCategories = categories.length - 1;

  return (
    <div className="py-4">
      <Container fluid>
        {/* Header Section */}
        <Row className="mb-5">
          <Col className="text-center">
            <h1 className="display-4 fw-bold text-dark mb-3">Our Library Collection</h1>
            <p className="text-muted fs-5 mb-4">
              Explore our vast collection of books and resources
            </p>
            <BookSearch onSearch={handleSearch} isLoading={loading} />
          </Col>
        </Row>

        {/* Category Filter */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-1 me-2">
                <Filter size={18} className="text-muted" />
                <span className="text-muted small fw-semibold">Filter by:</span>
              </div>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => filterByCategory(category)}
                  className="rounded-pill px-3"
                >
                  {category}
                  {category !== 'All' && (
                    <Badge bg={selectedCategory === category ? 'light' : 'secondary'} className="ms-2">
                      {books.filter(b => b.category === category).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </Col>
        </Row>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6} className="text-center py-5">
              <div className="bg-light rounded-4 p-5">
                <h3 className="text-muted mb-3">📚 No Books Found</h3>
                <p className="text-muted mb-0">
                  No books match your search criteria. Try adjusting your search or clear the filters.
                </p>
              </div>
            </Col>
          </Row>
        ) : (
          <Row className="g-4">
            {filteredBooks.map((book) => (
              <Col key={book.id} xs={12} sm={6} lg={4} xl={3}>
                <BookCard 
                  book={book} 
                  onEdit={handleEditClick}  // ← Pass edit handler
                />
              </Col>
            ))}
          </Row>
        )}

        {/* Pagination Placeholder (optional) */}
        {filteredBooks.length > 12 && (
          <Row className="mt-4">
            <Col>
              <div className="d-flex justify-content-center">
                <nav>
                  <ul className="pagination">
                    <li className="page-item disabled"><span className="page-link">Previous</span></li>
                    <li className="page-item active"><span className="page-link">1</span></li>
                    <li className="page-item"><span className="page-link">2</span></li>
                    <li className="page-item"><span className="page-link">3</span></li>
                    <li className="page-item"><span className="page-link">Next</span></li>
                  </ul>
                </nav>
              </div>
            </Col>
          </Row>
        )}

        {/* Edit Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit Book: ${selectedBook?.title || ''}`}
          size="lg"
        >
          {selectedBook && (
            <BookUpload
              onSuccess={handleEditSuccess}
              initialData={selectedBook}
              isEdit={true}
            />
          )}
        </Modal>
      </Container>
    </div>
  );
};

export default BooksPage;