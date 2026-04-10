const pool = require('../config/db');

const Book = {

    // adding a book to the DB
    async createBook(data) {
        const {title, author, category, description, file_path, file_size, format} = data;

        const query = `
        INSERT INTO books (title, author, category, description, file_path, file_size, format)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
        `;

        const values = [title, author, category, description, file_path, file_size, format];

        const result = await pool.query(query, values);
        return result.rows[0]; // returns the newly created book record
    },

    // fetching all books from the DB
    async getAllBooks(){
        const query = 'SELECT * FROM books ORDER BY uploaded_at DESC';
        const result = await pool.query(query);
        return result.rows; 
    },

    // getting a book by it's id 
    async getBookById(id) {
        const query = `SELECT * FROM books WHERE id = $1;`;
        const result = await pool.query(query, [id]);
        return result.rows[0]; // will tell us undefined if no book found

    },

    // updating the book metadata but doesn't update the file 
    async updateBook(id, data) {
        const {title, author, category, description, format} = data;
        const query = `UPDATE books SET 
        title = $1,
        author = $2,
        category = $3,
        description = $4,
        format = $5
        WHERE id = $6
        RETURNING *;
        `;
        const values = [title, author, category, description, format, id];
        
        const result = await pool.query(query, values);
        return result.rows[0]; // will tell us undefined if no book found
    },

    // delete a book from the DB using it's id but the file deletion is handled in the routes
    async deleteBook(id) {
        const query = `DELETE FROM books WHERE id = $1
        RETURNING *;
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0]; // will tell us undefined if no book found

    },

    // incrementing download counter by 1 anytime the book was downloaded
    // this is called inside the download route
    async incrementDownloadCount(id){
        const query =`UPDATE books SET download_count = download_count + 1
        WHERE id = $1
        RETURNING download_count;
        `;
        
        const result = await pool.query(query, [id]);
        return result.rows[0]; // will tell us undefined if no book found
        
    },

    // the search egine for each book by title, author or category used in tge search bar 
    async searchBook(keyword) {
        const query = `SELECT id, title, author, category, description, file_size, format, download_count, uploaded_at
        FROM books
        WHERE 
            title ILIKE $1 OR
            author ILIKE $1 OR
            category ILIKE $1
        ORDER BY uploaded_at DESC;
        `; // ILIKE key word is for case-insensitive search

        const searchTerm = `%${keyword}%`;

        const result = await pool.query(query, [searchTerm]);
        return result.rows;  // returns the result of the search
    }

};

module.exports = Book;