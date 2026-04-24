// load .env first before anything else
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const path = require('path');
const pool = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const dashbourdRoutes = require('./routes/dashboardRoutes');
const { error } = require('console');
const { json } = require('stream/consumers');
// const borrowRoutes = require('./routes/borrowRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: This parses JSON data sent in POST requests
app.use(express.json()); // all express to ready the req.body

// serve uploads PDF files as static files eg http://localhost:3000/uploads/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/books', bookRoutes); //makes all book routes start with api/books
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashbourdRoutes);
// app.use('/api/borrows', borrowRoutes);

// welcome route
app.get('/', (req, res) => {
    res.send('📚 Welcome to Impact Library API');
});

async function testConnection() {
    try{
        // testing the connection 
        const client = await pool.connect();
        console.log('✅ Success: Connected to impact_library_db')

        // simple query to display time
        const res = await client.query('SELECT NOW()');
        console.log('🕒 Database Time:', res.rows[0].now);

        client.release();
    } catch (err) {
        console.error('❌ Connection Error:', err.message);
    }
};

// Our overall error handler
app.use((err, req, res, next) => {
    // multer file size exceeded
    if (err.code === 'LIMIT_FILE_SIZE'){
        return res.status(400).json({
            error: "File too large. (max 50MB)"
        });
    }

    // checking file type
    if (err.message === 'Only PDF files are allowes for now'){
        return res.status(400).json({
            error: "Only PDF files are allowed"
        });
    }

    // invalid JSON body
    if (err.type === 'entity.parse.failed'){
        return res.status(400).json({
            error: "Invalid JSON in request body"
        });
    }

    // any other error
    console.error('❌ Unhandled Error:', err.message);
    res.status(500),json({
        error: "Something went wrong in the server",
        details: err.message
    });
});



app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📡 GET    http://localhost:${PORT}/api/books`);
    console.log(`📩 POST   http://localhost:${PORT}/api/books`);
    testConnection();
})