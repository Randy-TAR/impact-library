const bcrypt = require('bcrypt');
const pool = require('../config/db');

const User = {

    // creating a new user with role checking
    async createUser(data) {
        const {name, email, password, role, contact } = data;

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = `
        INSERT INTO users (name, email, password, role, contact)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role, contact, created_at;
        `;
        const values = [name, email, hashedPassword, role, contact];

        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // get all users
    async getAllUsers() {
        const query = 'SELECT id, name, email, role, contact, created_at FROM users ORDER BY id ASC;' ;
        const result = await pool.query(query);
        return result.rows;
    },

    // finding user by email and password
    // async findUserByCredentials(email, password) {
    //     const query = `
    //     SELECT id, name, email, role, contact
    //     FROM users 
    //     WHERE email = $1 AND password = $2;
    //     `;
    //     const values = [email, password];

    //     const result = await pool.query(query, values);
    //     return result.rows[0]; // Returns the user if both match, otherwise undefined
    // }

    async findUserByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

};

module.exports = User;