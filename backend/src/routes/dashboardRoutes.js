const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// this routes fetches statistics information for ADMIN $ LIBRARIAN: GET/
router.get('/', verifyToken, authorizeRole('admin', 'librarian'), async(req, res) => {
    try{
        // all books in the library
        const totalBooksQuery = `
        SELECT COUNT(*) AS total_books
        FROM books;
        `;

        //total number of downloads in all books 
        const totalDownloadsQuery = `
        SELECT COALESCE (SUM(download_count), 0) AS total_downloads
        FROM books;
        `; //COALESCE will retun a 0 incase no book exist

        // 5 most downloaded books
        const topBooksQuery = `
        SELECT id, title, author, download_count
        FROM books ORDER BY download_count DESC
        LIMIT 5;
        `;

        // number of books per category
        const booksByCategoryQuery = `
            SELECT 
                category,
                COUNT(*) AS book_count
            FROM books
            GROUP BY category
            ORDER BY book_count DESC;
        `;

        // 5 most recently uploaded books
        const recentUploadsQuery = `
            SELECT id, title, author, category, uploaded_at
            FROM books
            ORDER BY uploaded_at DESC
            LIMIT 5;
        `;
        
        // getting the total number of librarians/users and admins in the system
        const totalUsersQuery = `
        SELECT role, COUNT(*) AS count
        FROM users GROUP BY role;
        `;

        // running all queries above at the same time 
        const [
             totalBooks,
            totalDownloads,
            topBooks,
            booksByCategory,
            recentUploads,
            totalUsers
        ] = await Promise.all([
            pool.query(totalBooksQuery),
            pool.query(totalDownloadsQuery),
            pool.query(topBooksQuery),
            pool.query(booksByCategoryQuery),
            pool.query(recentUploadsQuery),
            pool.query(totalUsersQuery)
        ]);

        //sending all statistics in one clean response
        res.status(200).json({
            total_books:      parseInt(totalBooks.rows[0].total_books),
            total_downloads:  parseInt(totalDownloads.rows[0].total_downloads),
            top_books:        topBooks.rows,
            books_by_category: booksByCategory.rows,
            recent_uploads:   recentUploads.rows,
            users:            totalUsers.rows
        });

    } catch(err){
        res.status(500).json({
            error: "Failed to fetch dashbourd statistics",
            details: err.message 
        });
    }
});

module.exports = router;