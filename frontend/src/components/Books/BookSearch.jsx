import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Form, Button, InputGroup } from 'react-bootstrap';

const BookSearch = ({ onSearch, isLoading }) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  const handleClear = () => {
    setKeyword('');
    onSearch('');
  };

  return (
    <Form onSubmit={handleSubmit} className="w-100 mx-auto" style={{ maxWidth: '600px' }}>
      <InputGroup size="lg">
        <InputGroup.Text className="bg-white">
          <Search size={20} className="text-muted" />
        </InputGroup.Text>
        <Form.Control
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search books by title, author, or category..."
          className="border-start-0"
        />
        {keyword && (
          <Button
            variant="outline-secondary"
            onClick={handleClear}
            type="button"
          >
            <X size={18} />
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !keyword.trim()}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </InputGroup>
    </Form>
  );
};

export default BookSearch;