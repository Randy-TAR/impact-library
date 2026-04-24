const { Pool } = require('pg');
require('dotenv').config();
const bcrypt = require('bcrypt');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'impact_library',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
});

const recreateTables = async () => {
    console.log('🔄 Recreating database tables...');
    
    // Drop existing tables (order matters)
    await pool.query(`DROP TABLE IF EXISTS borrow_records CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS books CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS users CASCADE`);
    console.log('✓ Old tables dropped');
    
    // Create users table
    await pool.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) DEFAULT 'user',
            contact VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✓ Users table created');
    
    // Create books table - NO duplicate book_id column
    await pool.query(`
        CREATE TABLE books (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            description TEXT,
            file_path VARCHAR(500),
            file_size VARCHAR(50),
            format VARCHAR(50) DEFAULT 'PDF',
            download_count INTEGER DEFAULT 0,
            available_count INTEGER DEFAULT 1,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✓ Books table created (id is primary key)');
    
    // Create borrow_records table
    await pool.query(`
        CREATE TABLE borrow_records (
            id SERIAL PRIMARY KEY,
            book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
            borrower_name VARCHAR(255) NOT NULL,
            borrower_contact VARCHAR(50),
            issued_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            borrow_date DATE,
            due_date DATE,
            return_date DATE,
            status VARCHAR(50) DEFAULT 'borrowed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log('✓ Borrow records table created');
    
    console.log('\n✅ All tables recreated successfully!');
};

const seedData = async () => {
    console.log('\n📝 Inserting sample data...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insert admin user
    await pool.query(`
        INSERT INTO users (name, email, password, role, contact)
        VALUES ($1, $2, $3, $4, $5)
    `, ['Admin User', 'admin@example.com', hashedPassword, 'admin', '1234567890']);
    console.log('✓ Admin user created');
    
    // Insert regular user
    await pool.query(`
        INSERT INTO users (name, email, password, role, contact)
        VALUES ($1, $2, $3, $4, $5)
    `, ['John Doe', 'john@example.com', hashedPassword, 'user', '0987654321']);
    console.log('✓ Regular user created');
    
    // Insert sample books - no book_id needed
    await pool.query(`
        INSERT INTO books (title, author, category, description, file_size, format, available_count)
        VALUES 
            ('The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 'A classic novel about the Jazz Age', '2.5 MB', 'PDF', 3),
            ('Introduction to Programming', 'John Smith', 'Technology', 'Learn programming basics', '5.1 MB', 'PDF', 2),
            ('History of Art', 'Maria Garcia', 'Art', 'A comprehensive guide to art history', '8.3 MB', 'PDF', 1),
            ('Business Management', 'Robert Johnson', 'Business', 'Essential business strategies', '3.7 MB', 'PDF', 2),
            ('Data Science Guide', 'Sarah Williams', 'Technology', 'Introduction to data science', '6.2 MB', 'PDF', 1)
    `);
    console.log('✓ Sample books created (5 books)');
    
    console.log('\n✅ Database initialization complete!');
    console.log('\n🔑 Test accounts:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User:  john@example.com / admin123');
};

const runSetup = async () => {
    try {
        await recreateTables();
        await seedData();
        process.exit(0);
    } catch (err) {
        console.error(' Error:', err.message);
        process.exit(1);
    }
};

runSetup();