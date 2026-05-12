const bcrypt = require('bcrypt');
const pool = require('../config/db');

const User = {

    // create a new user — used for both public registration and admin-created accounts
    async createUser(data) {
        const { name, email, password, role, contact } = data;

        // hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, email, password, role, contact)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email, role, contact, created_at;
        `;

        const values = [name, email, hashedPassword, role || 'user', contact];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // get all users — admin only
    async getAllUsers() {
        const query = `
            SELECT id, name, email, role, contact, created_at 
            FROM users 
            ORDER BY id ASC;
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    // find user by email — used for login
    async findUserByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1', 
            [email]
        );
        return result.rows[0]; // returns undefined if not found
    },

    // find user by ID — used for delete verification
    async findUserById(id) {
        const result = await pool.query(
            'SELECT id, name, email, role FROM users WHERE id = $1', 
            [id]
        );
        return result.rows[0]; // returns undefined if not found
    },

    // delete a user by ID — admin only
    async deleteUser(id) {
        const query = `
            DELETE FROM users 
            WHERE id = $1
            RETURNING id, name, email, role;
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0]; // returns undefined if not found
    }
};

module.exports = User;