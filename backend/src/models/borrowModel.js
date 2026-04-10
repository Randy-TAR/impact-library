const pool = require('../config/db')

const BorrowRecord = {
    async createBorrowRecord(data) {
        const {
            book_id,
            borrower_name,
            borrower_contact,
            issued_by,
            borrow_date,
            due_date
        } = data;

        const insertQuery = `
        INSERT INTO borrow_records 
            (book_id, borrower_name, borrower_contact, issued_by, borrow_date, due_date)
        VALUES 
            ($1,$2,$3,$4,$5,$6)
        RETURNING *;
        `;

        const insertValues = [
            book_id,
            borrower_name,
            borrower_contact,
            issued_by,
            borrow_date,
            due_date
        ];

        const result = await pool.query(insertQuery, insertValues);

        const updateBookQuery =`
        UPDATE books
        SET available_count = available_count-1
        WHERE book_id = $1 AND available_count > 0
        RETURNING available_count;
        `;

        const updateBook = await pool.query(updateBookQuery, [book_id]);

        if(updateBook.rows.length === 0) {
            throw new Error('No available copies of this book');
        }

        return result.rows[0];
    },

    // fetching all borrow records with books id and lib name
    // joins the books and users tables for readable output
    async getAllRecords() {
        const query = `
            SELECT 
                br.id,
                br.borrower_name,
                br.borrower_contact,
                br.borrow_date,
                br.due_date,
                br.return_date,
                br.status,
                b.tittle      AS book_title,   -- from books table
                b.book_id,
                u.name        AS issued_by      -- from users table
            FROM borrow_records br
            JOIN books b ON br.book_id = b.book_id
            JOIN users u ON br.issued_by = u.id
            ORDER BY br.borrow_date DESC;       -- most recent first
        `;

        const result = await pool.query(query);
        return result.rows;
    },

    //  Marks a borrow record as returned and restores book availability
    // Called when a member physically returns the book
    async markAsReturned(id) {
        const findQuery = `
        SELECT * FROM borrow_records
        WHERE id = $1 AND status = 'borrowed';
        `;

        const found = await pool.query(findQuery, [id]);

        // checking if If no active borrow found, it's already returned or doesn't exist  
        if (found.rows.length === 0) {
            throw new Error('Borrow record not found or already returned');
        } 

        const record = found.rows[0];

        // update the record as returned with today's date
        const returnQuery = `
        UPDATE borrow_records
        SET 
            status = 'returned',
            return_date = CURRENT_DATE
        WHERE id = $1
        RETURNING *;
        `;

        const returned = await pool.query(returnQuery, [id])

        // increment available_count by 1 since book is back
        const restoreBookQuery = `
        UPDATE books
        SET available_count = available_count + 1
        WHERE book_id = $1
        RETURNING available_count;
        `;

        await pool.query(restoreBookQuery, [record.book_id]);

        return returned.rows[0];
    }
};

module.exports = BorrowRecord;