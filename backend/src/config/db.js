const {Pool} = require('pg');

// configuring the connection

// const pool = new Pool({
//     user: 'randytar',
//     host: 'localhost',
//     database: 'impact_library_db',
//     password: 'Admin',
//     port: 5432,
// });

const pool = new Pool({
    user:     process.env.DB_USER,
    host:     process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port:     parseInt(process.env.DB_PORT)
});

module.exports = pool; 