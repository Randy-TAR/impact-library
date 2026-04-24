import React, { useState, useCallback } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { bookService } from '../../services/bookService';
import { useNotification } from '../../hooks/useNotification';
import { Form, Button, Card, ProgressBar, Row, Col } from 'react-bootstrap';

const BookUpload = ({ onSuccess, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    author: initialData?.author || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    available_count: initialData?.available_count || 1,
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { showSuccess, showError } = useNotification();

  const categories = [
    'Fiction', 'Non-Fiction', 'Science', 'Technology', 
    'History', 'Biography', 'Children', 'Education',
    'Business', 'Health', 'Art', 'Religion', 'Philosophy',
    'Psychology', 'Self-Help', 'Travel', 'Cookbooks'
  ];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      showError('Please drop a valid PDF file');
    }
  }, [showError]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      showError('Please select a valid PDF file');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEdit && !file) {
      showError('Please select a PDF file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    const uploadData = new FormData();
    if (file) uploadData.append('file', file);
    Object.keys(formData).forEach(key => {
      uploadData.append(key, formData[key]);
    });

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      if (isEdit && initialData?.id) {
        await bookService.updateBook(initialData.id, formData);
        showSuccess('Book updated successfully!');
      } else {
        await bookService.uploadBook(uploadData);
        showSuccess('Book uploaded successfully!');
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        if (!isEdit) {
          setFormData({ title: '', author: '', category: '', description: '', available_count: 1 });
          setFile(null);
        }
        setUploadProgress(0);
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      showError(error.response?.data?.error || `Failed to ${isEdit ? 'update' : 'upload'} book`);
      setUploadProgress(0);
    } finally {
      setTimeout(() => setUploading(false), 500);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <Col lg={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-dark">
              Book Title <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter the full book title"
              disabled={uploading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-dark">
              Author <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              placeholder="Enter author name(s)"
              disabled={uploading}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  Category <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={uploading}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  Available Copies <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="available_count"
                  value={formData.available_count}
                  onChange={handleChange}
                  required
                  min="1"
                  max="100"
                  placeholder="Number of copies available"
                  disabled={uploading}
                />
                <Form.Text className="text-muted">
                  How many copies of this book are available for borrowing
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold text-dark">
              Description <span className="text-muted">(Optional)</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a brief description of the book..."
              disabled={uploading}
            />
          </Form.Group>

          {!isEdit && (
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark">
                PDF File <span className="text-danger">*</span>
              </Form.Label>
              
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-3 p-4 text-center transition-all ${
                    dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary bg-light'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    id="file-upload"
                    className="d-none"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload" className="d-block w-100 cursor-pointer">
                    <Upload size={48} className={`mx-auto mb-3 ${dragActive ? 'text-primary' : 'text-muted'}`} />
                    <h6 className={dragActive ? 'text-primary' : 'text-dark'}>
                      {dragActive ? 'Drop your PDF file here' : 'Drag & drop your PDF file here'}
                    </h6>
                    <p className="text-muted small mb-2">or</p>
                    <Button variant="outline-primary" size="sm" disabled={uploading}>
                      Browse Files
                    </Button>
                    <p className="text-muted small mt-3 mb-0">Supported format: PDF (Max 10MB)</p>
                  </label>
                </div>
              ) : (
                <Card className="border-2 border-success bg-light">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-success bg-opacity-10 rounded-circle p-2">
                          <FileText size={24} className="text-success" />
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">{file.name}</h6>
                          <small className="text-muted">{formatFileSize(file.size)} • PDF Document</small>
                        </div>
                      </div>
                      <Button variant="outline-danger" size="sm" onClick={removeFile} disabled={uploading}>
                        <X size={14} /> Remove
                      </Button>
                    </div>
                    {uploading && (
                      <div className="mt-3">
                        <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} animated={uploadProgress < 100} />
                        <p className="text-muted small mt-2 mb-0 text-center">
                          {uploadProgress === 100 ? 'Upload complete!' : 'Uploading...'}
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </Form.Group>
          )}

          <Button type="submit" variant="primary" size="lg" disabled={uploading} className="w-100 py-2">
            {uploading ? (isEdit ? 'Updating...' : 'Uploading...') : (isEdit ? 'Update Book' : 'Upload Book')}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default BookUpload;