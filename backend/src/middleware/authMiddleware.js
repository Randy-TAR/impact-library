const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "secret_key_123";

// const authMiddleware = {
//     // Verifying if the user is logged in with the JWT token
//     verifyToken: (req, res, next) => {
//         const token = req.headers['authorization']?.split(' ')[1]; // Get token from "Bearer <token>"

//         if (!token) {
//             return res.status(403).json({ error: "No token provided. Access denied." });
//         }

//         try {
//             const decoded = jwt.verify(token, JWT_SECRET);
//             req.user = decoded; // Add user data (id, role) to the request object
//             next(); // Move to the next function
//         } catch (err) {
//             return res.status(401).json({ error: "Invalid or expired token." });
//         }
//     },

//     // 🔑 2. Check if the user has the right Role
//     authorizeRole: (requiredRole) => {
//         return (req, res, next) => {
//             if (req.user.role !== requiredRole) {
//                 return res.status(403).json({ 
//                     error: `Access denied. ${requiredRole} status required.` 
//                 });
//             }
//             next();
//         };
//     }
// };
// -------------------------------------------------------------------------------------------------------------------------------------


const authMiddleware = {

    // Checks if the user is logged in by verifying their JWT token
    verifyToken: (req, res, next) => {

        // Extract token from the Authorization header: "Bearer <token>"
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(403).json({ 
                error: "No token provided. Access denied." 
            });
        }

        try {
            // Decode and verify the token using the secret key
            const decoded = jwt.verify(token, JWT_SECRET);

            // Attach decoded user data (id, role) to req so next functions can use it
            req.user = decoded;

            next(); // Token is valid — move to the next middleware/route
        } catch (err) {
            return res.status(401).json({ 
                error: "Invalid or expired token." 
            });
        }
    },

    // Checks if the logged-in user has one of the allowed roles
    // Usage: authorizeRole('admin') or authorizeRole('librarian', 'admin')
    authorizeRole: (...allowedRoles) => {
        return (req, res, next) => {

            // Check if the user's role is in the list of allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    error: `Access denied. Required role: ${allowedRoles.join(' or ')}.` 
                });
            }

            next(); // Role is allowed — proceed
        };
    }
};


module.exports = authMiddleware;
