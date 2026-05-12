const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Book = require('../models/bookModel');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const { validateBook } = require('../middleware/validationMiddleware');


/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book catalog management and downloads
 */


// ──────────────────────────────────────────────
// PUBLIC ROUTES — no login required
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     description: Returns all books in the public catalog — no login required
 *     responses:
 *       200:
 *         description: List of all books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
    try {
        const allBooks = await Book.getAllBooks();
        res.status(200).json(allBooks);
    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch books",
            details: err.message
        });
    }
});


/**
 * @swagger
 * /api/books/search:
 *   get:
 *     summary: Search books
 *     tags: [Books]
 *     description: Search books by title, author, or category — no login required
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *         example: alchemist
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       400:
 *         description: Missing keyword
 */
router.get('/search', async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword) {
            return res.status(400).json({
                error: "Please provide a search word"
            });
        }

        const results = await Book.searchBook(keyword);
        res.status(200).json(results);

    } catch (err) {
        res.status(500).json({
            error: "Search failed",
            details: err.message
        });
    }
});


/**
 * @swagger
 * /api/books/download/{id}:
 *   get:
 *     summary: Download a book PDF
 *     tags: [Books]
 *     description: Downloads the PDF file and increments the download counter
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: PDF file download
 *       404:
 *         description: Book or file not found
 */
router.get('/download/:id', async (req, res) => {
    try {
        const book = await Book.getBookById(req.params.id);

        if (!book) {
            return res.status(404).json({
                error: "Book not available"
            });
        }

        // build full file path on the server
        const filePath = path.join(__dirname, '..', book.file_path);

        // check if file actually exists on disk
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: "Book file not found on the server"
            });
        }

        // increment download counter before sending file
        await Book.incrementDownloadCount(req.params.id);

        // send the file as a download
        res.download(filePath, `${book.title}-impact_library.pdf`);

    } catch (err) {
        res.status(500).json({
            error: "Download failed",
            details: err.message
        });
    }
});


/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a single book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.getBookById(req.params.id);

        if (!book) {
            return res.status(404).json({
                error: "Book not found"
            });
        }

        res.status(200).json(book);

    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch book",
            details: err.message
        });
    }
});


// ──────────────────────────────────────────────
// PROTECTED ROUTES — librarian or admin only
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Upload a new book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     description: Upload a book with a PDF file — librarian or admin only
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, author, category, file]
 *             properties:
 *               title:
 *                 type: string
 *                 example: The Alchemist
 *               author:
 *                 type: string
 *                 example: Paulo Coelho
 *               category:
 *                 type: string
 *                 example: Fiction
 *               description:
 *                 type: string
 *                 example: A journey of self-discovery
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Book uploaded successfully
 *       400:
 *         description: Validation error or missing file
 *       403:
 *         description: Unauthorized — librarian or admin required
 */
router.post('/', verifyToken, authorizeRole('librarian', 'admin'), upload.single('file'), ...validateBook, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "Please upload a PDF file"
            });
        }

        const bookData = {
            title:       req.body.title,
            author:      req.body.author,
            category:    req.body.category,
            description: req.body.description,
            file_path:   `uploads/${req.file.filename}`,
            file_size:   `${(fs.statSync(req.file.path).size / (1024 * 1024)).toFixed(2)} MB`,
            format:      'PDF'
        };

        const newBook = await Book.createBook(bookData);

        res.status(201).json({
            message: "Book uploaded successfully",
            book: newBook
        });

    } catch (err) {
        res.status(500).json({
            error: "Failed to upload book",
            details: err.message
        });
    }
});


/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update book metadata
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               format:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       404:
 *         description: Book not found
 */
router.put('/:id', verifyToken, authorizeRole('librarian', 'admin'), ...validateBook, async (req, res) => {
    try {
        const updatedBook = await Book.updateBook(req.params.id, req.body);

        if (!updatedBook) {
            return res.status(404).json({
                error: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book updated successfully",
            book: updatedBook
        });

    } catch (err) {
        res.status(500).json({
            error: "Failed to update book",
            details: err.message
        });
    }
});


/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     description: Deletes the book record and its PDF file from server — admin only
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */
router.delete('/:id', verifyToken, authorizeRole('admin'), async (req, res) => {
    try {
        const deletedBook = await Book.deleteBook(req.params.id);

        if (!deletedBook) {
            return res.status(404).json({
                error: "Book not found"
            });
        }

        // delete the actual PDF file from /uploads
        const filePath = path.join(__dirname, '..', deletedBook.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.status(200).json({
            message: "Book deleted successfully",
            book: deletedBook
        });

    } catch (err) {
        res.status(500).json({
            error: "Failed to delete book",
            details: err.message
        });
    }
});


module.exports = router;