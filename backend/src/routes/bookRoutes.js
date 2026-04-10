const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs'); // biult-in Node.js file system module
const Book = require('../models/bookModel'); // this is the link to the model we created for the books
const upload = require('../middleware/uploadMiddleware')
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware'); // the middleware to chack only lib to add book
const { error } = require('console');
const { title } = require('process');


// ──────────────────────────────────────────────
// Our PUBLIC ROUTES  — no login required
// ──────────────────────────────────────────────

// route to fetch all books GET/books
router.get('/', async (req, res) => {
    try {
        const allBooks = await Book.getAllBooks(); // calling the get all books function from the Book model
        res.status(200).json(allBooks);
    }catch (err){
        res.status(500).json({
            error: "Failed to fetch books",
            details: err.message
        });
    }
});

// route for searching a book by title, author, or category: GET/search?keyword=your_input
router.get('/search', async(req, res) => {
    try{
        const { keyword } = req.query; // gets the keyword from the URL
        //checking if keyword was provided
        if(!keyword) {
            return res.status(400).json({
                error: "Please provide a search word"
            });
        }

        const results = await Book.searchBook(keyword);

        res.status(200).json(results);

    } catch (err){
        res.status(500).json({
            error: "Search failed",
            details: err.message
        });

    }
});

// fetching a single book by its id for the book details page: GET/:id
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.getBookById(req.params.id);

        // checking if book doesnot exist
        if (!book) {
            return res.status(404).json({
                error: "Book not found"
            });
        }

        res.status(200).json(book);

    } catch (err){
        res.status(500).json({
            error: "Failed to fetch book",
            details: err.message
        });
    }
});

// route to download and increment the download counter: GET/download/:id
router.get('/download/:id', async(req, res) => {
    try{
        const book = await Book.getBookById(req.params.id);

        //check if book is available
        if(!book) {
            return res.status(404).json({
                error: "Book not available"
            });
        }

        // getting the full file/book path in the server
        const filePath = path.join(__dirname, '..', book.file_path);

        // checking if file/book exixt 
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: "Book not found on the server"
            });
        }

        // incrementing the book download counter
        await Book.incrementDownloadCount(req.params.id);

        // sending the file/book to the user as a download
        res.download(filePath, `${book.title}-impact_library.pdf`);

    } catch(err) {
        res.status(500).json({
            error: "Download failed",
            details: err.message
        });
    }
});

// ──────────────────────────────────────────────
// PROTECTED ROUTES — for users
// ──────────────────────────────────────────────


// ──────────────────────────────────────────────
// PROTECTED ROUTES — librarian or admin only
// ──────────────────────────────────────────────

//uploading a new book and the pdf file: POST/
// multer handles the uploaded file field named 'file' : upload.single('file)
router.post('/', verifyToken, authorizeRole('librarian', 'admin'), upload.single('file'), async(req, res) => {
    try{
        // checking if a file was actually uploaded 
        if(!req.file) {
            return res.status(400).json({
                error: "please upload a PDF file"
            });
        }

        // the book data  + the uploaded file info
        const bookData = {
            title: req.body.title,
            author: req.body.author,
            category: req.body.category,
            description: req.body.description,
            file_path: `uploads/${req.file.filename}`,  // the file path
            file_size: `${(req.file.size/ (1024*1024)).toFixed(2)} MB`, // this converts the bytes to MB
            format: 'PDF'
        };

        const newBook = await Book.createBook(bookData);

        res.status(201).json({
            message: "Book uploaded successfully",
            book: newBook
        });
    } catch(err) {
        res.status(500).json({
            error: "failed to upload book",
            details: err.message
        });
    }
});

// Update the books: PUT/:id
router.put('/:id', verifyToken, authorizeRole('librarian', 'admin'), async(req, res) => {
    try{
        const updatedBook = await Book.updateBook(req.params.id, req.body);

        // checking if the book exist
        if(!updatedBook) {
            return res.status(400).json({
                error: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book updated succefully",
            book: updatedBook
        });

    } catch(err) {
        res.status(500).json({
            error: "Failed to update book",
            details: err.message
        });
    }
});

// Delete a book and it's file from the server: DELETE/:id
router.delete('/:id', verifyToken, authorizeRole('admin'), async (req, res) => {
    try{
        const deletedBook = await Book.deleteBook(req.params.id);

        // check if the book exist
        if(!deletedBook) {
            return res.status(400).json({
                error: "Book not found"
            });
        }

        //delete the actual pdf
        const filePath = path.join(__dirname, '..', deletedBook.file_path);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); //deletes the pdf/book fro the file
        }

        res.status(200).json({
            message: "Book deleted successfully",
            book: deletedBook
        });
    } catch(err) {
        res.status(500).json({
            error: "Failed ro delete book",
            details: err.message
        });
    }
});



module.exports = router;