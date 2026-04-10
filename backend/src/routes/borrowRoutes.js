const express = require('express');
const router = express.Router();
const BorrowRecord = require('../models/borrowModel');
const {verifyToken, authorizeRole} = require('../middleware/authMiddleware');

// give out book to a user POST/
router.post('/', verifyToken, authorizeRole('librarian', 'admin'), async(req, res) => {
    try{
        const borrowData = {
            ...req.body,
            issued_by: req.user.id 
        };

        const newRecord = await BorrowRecord.createBorrowRecord(borrowData);

        res.status(201).json({
            message: "Book borrowed/given out successfully",
            record: newRecord
        });
    }catch (err){
        // when no copies are availabe
        if (err.message === 'No available copies of this book') {
            return res.status(400).json({
                error: "No available copies of this book"
            });
        }
        res.status(500).json({
            error: "Failed to record borrowing",
            details: err.message
        });

    }
});

// get all borrow records (librarian or admin only) GET/api/borrows
router.get('/', verifyToken, authorizeRole('librarian', 'admin'), async (req, res) => {
    try {
        const allRecords = await BorrowRecord.getAllRecords();

        res.status(200).json(allRecords);

    } catch (err) {
        res.status(500).json({
            error: "Failed to fetch borrow records",
            details: err.message
        });
    }
});

// Mark a book as returned (librarian or admin only) PUT
router.put('/:id/return', verifyToken, authorizeRole('librarian', 'admin'), async (req, res) => {
    try {
        const { id } = req.params; // get the borrow record id from the URL

        const returnedRecord = await BorrowRecord.markAsReturned(id);

        res.status(200).json({
            message: "Book returned successfully",
            record: returnedRecord
        });

    } catch (err) {
        // Handle already returned or not found clearly
        if (err.message === 'Borrow record not found or already returned') {
            return res.status(404).json({ 
                error: "Borrow record not found or already returned" 
            });
        }
        res.status(500).json({
            error: "Failed to process return",
            details: err.message
        });
    }
});

module.exports = router;