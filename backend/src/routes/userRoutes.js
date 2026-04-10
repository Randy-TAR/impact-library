const express = require('express')
// const router = require('./bookRoutes');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
// const { route } = require('./bookRoutes');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');


//define a secrete JWT key 
const JWT_SECRET = process.env.JWT_SECRET || "secret_key_123";

//user registration route to create new user POST/user/register (only for the ADMIN)
router.post('/register', verifyToken, authorizeRole('admin'), async (req, res) => {
    try{

        // console.log('🔍 Login attempt with email:', email);

        const newUser = await User.createUser(req.body);

        // console.log('👤 User found:', user); 

        res.status(201).json({
            message: "User registered successfully!",
            user: newUser
        });
    } catch (err) {
        // checks for unique emails in the DB
        if (err.code === '23505') {
            return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: err.message });
    }
});

//login route to login the user and Authentication $ get token: POST/users/login 
router.post('/login', async (req, res) => {
    const {email, password } = req.body;

    try {
        // get a users email
        const user = await User.findUserByEmail(email);
        if (!user) return res.status(404).json({ 
            error: "User not found"
        });

        // comparing the passwords in the DB
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(401).json({
            error: "Invalid Password/credentials"
        });

        // generating JWT: keeping the id and the role inside the JWT token payload
        const token = jwt.sign(
            {id: user.id, role: user.role },
            JWT_SECRET,
            {expiresIn: '4h'} //Token is set to expire in 4 hours
        );

        res.status(200).json({
            message: "Login Successfull",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });

    }catch (err) {
        res.status(500).json({error: err.message});
    }
});

//getting all users in the system: GET/users (Only for The ADMIN)
//adout page should have all users 
router.get('/', async (req, res) => {
    try{
        const allUsers = await User.getAllUsers();
        res.status(200).json(allUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;