const {Pool} = require('pg');

// configuring the connection
const pool = new Pool({
    user: 'randytar',
    host: 'localhost',
    database: 'impact_library_db',
    password: 'Admin',
    port: 5432,
});

module.exports = pool; 