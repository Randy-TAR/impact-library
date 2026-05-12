const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
// const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');
const { validateRegister, validatePublicRegister, validateLogin } = require('../middleware/validationMiddleware');


// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication and management
 */

// ──────────────────────────────────────────────────────────
// PUBLIC ROUTES — no login required
// ──────────────────────────────────────────────────────────

// POST /register → Public user self-registration
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Public user registration
 *     tags: [Users]
 *     description: Anyone can create a regular user account — role is always 'user'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: 'John Doe' }
 *               email:    { type: string, example: 'john@example.com' }
 *               password: { type: string, example: 'mypassword123' }
 *               contact:  { type: string, example: '671234567' }
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Email already exists or validation error
 */
// Any person can create their own account with role 'user'
router.post('/register', ...validatePublicRegister, async (req, res) => {
    try {
        const { name, email, password, contact } = req.body;

        // force role to 'user' — public users cannot self-assign admin/librarian
        const newUser = await User.createUser({
            name,
            email,
            password,
            role: 'user', // ✅ always 'user' for public registration
            contact
        });

        res.status(201).json({
            message: "Account created successfully!",
            user: newUser
        });

    } catch (err) {
        // duplicate email error
        if (err.code === '23505') {
            return res.status(400).json({ 
                error: "An account with this email already exists" 
            });
        }
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Users]
 *     description: Login for all user types — returns JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: 'randy@impactlib.com' }
 *               password: { type: string, example: 'password' }
 *     responses:
 *       200:
 *         description: Login successful — returns token
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
// POST /login → Login for ALL user types (user, librarian, admin)
router.post('/login', ...validateLogin, async (req, res) => {
    const { email, password } = req.body;

    try {
        // find user by email
        const user = await User.findUserByEmail(email);
        if (!user) return res.status(404).json({ 
            error: "User not found" 
        });

        // compare submitted password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ 
            error: "Invalid password or credentials" 
        });

        // generate JWT token with user id and role in payload
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '4h' } // token expires in 4 hours
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id:   user.id,
                name: user.name,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ──────────────────────────────────────────────────────────
// PROTECTED ROUTES — admin only
// ──────────────────────────────────────────────────────────

// POST /admin/create → Admin creates a librarian or another admin
/**
 * @swagger
 * /api/users/admin/create:
 *   post:
 *     summary: Admin creates librarian or admin account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Only admins can create librarian or admin accounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:     { type: string,  example: 'John Librarian' }
 *               email:    { type: string,  example: 'john@impactlib.com' }
 *               password: { type: string,  example: 'librarian123' }
 *               role:     { type: string,  enum: [admin, librarian] }
 *               contact:  { type: string,  example: '671000001' }
 *     responses:
 *       201:
 *         description: Account created
 *       400:
 *         description: Invalid role or email exists
 *       403:
 *         description: Admin access required
 */
// Only admins can create privileged accounts
router.post('/admin/create', verifyToken, authorizeRole('admin'), ...validateRegister, async (req, res) => {
    try {
        const { name, email, password, role, contact } = req.body;

        // admin can only create librarian or admin accounts
        if (!['admin', 'librarian'].includes(role)) {
            return res.status(400).json({ 
                error: "Role must be either 'admin' or 'librarian'" 
            });
        }

        const newUser = await User.createUser({ name, email, password, role, contact });

        res.status(201).json({
            message: `${role} account created successfully!`,
            user: newUser
        });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ 
                error: "An account with this email already exists" 
            });
        }
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Returns all users — admin only
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Admin access required
 */
// GET / → Get all users in the system — admin only
router.get('/', verifyToken, authorizeRole('admin'), async (req, res) => {
    try {
        const allUsers = await User.getAllUsers();
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     description: Permanently deletes a user account — admin only
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Cannot delete your own account
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
// DELETE /:id → Delete a user by ID — admin only
router.delete('/:id', verifyToken, authorizeRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        // prevent admin from deleting their own account
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ 
                error: "You cannot delete your own account" 
            });
        }

        // check user exists before deleting
        const existingUser = await User.findUserById(id);
        if (!existingUser) {
            return res.status(404).json({ 
                error: "User not found" 
            });
        }

        const deletedUser = await User.deleteUser(id);

        res.status(200).json({
            message: `User '${deletedUser.name}' deleted successfully`,
            user: deletedUser
        });

    } catch (err) {
        res.status(500).json({ 
            error: "Failed to delete user", 
            details: err.message 
        });
    }
});


module.exports = router;