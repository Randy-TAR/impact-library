console.log('✅ userRoutes.js loaded');
const express = require('express');
const path = require('path');
const pool = require('./config/db');
const bookRoutes = require('./routes/bookRoutes')
const userRoutes = require('./routes/userRoutes');
// const borrowRoutes = require('./routes/borrowRoutes');

const app = express();
const PORT =  3000;

// Middleware: This parses JSON data sent in POST requests
app.use(express.json()); // all express to ready the req.body

// serve uploads PDF files as static files eg http://localhost:3000/uploads/filename.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/books', bookRoutes); //makes all book routes start with api/books
app.use('/api/users', userRoutes); // makes all user routes start with api/users
// app.use('/api/borrows', borrowRoutes);


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

app.get('/', (req, res) => {
    res.send('📚 Welcome to Impact Library API')
});




app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📡 GET    http://localhost:${PORT}/api/books`);
    console.log(`📩 POST   http://localhost:${PORT}/api/books`);
    testConnection();
})