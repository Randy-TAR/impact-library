const { body, validationResult } = require('express-validator'); 
const { fields } = require('./uploadMiddleware');

// checking and returning any validation errors
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        // return all errors in a clean response
        return res.status(400).json({
            error: "Validatio failed",
            details: errors.array().map(err => ({
                field: err.path, // which field failed 
                message: err.msg // why it failed
            }))
        });
    }

    next(); // when no errors proceed to to route handler
};

// BOOK VALIDATION RULES - Used when uploading or updating a book
const validateBook = [
    // title is required and must not be empty
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Book title is required'),

    // author is required and must not be empty
    body('author')
        .trim()
        .notEmpty()
        .withMessage('Author name is required'),

    // category is required
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required'),

    // description is optional but if provided must be at least 10 chars
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters'),

    // run the validation checker after all rules
    checkValidation
];

// USER REGISTRATION VALIDATION RULES - Used when admin registers a new librarian
const validateRegister = [
    // name is required
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required'),

    // email must be a valid email format
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address'),

    // password must be at least 6 characters
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    // role must be either admin or librarian or user
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['admin', 'librarian','user'])
        .withMessage('Role must be either admin or librarian'),

    // run the validation checker after all rules
    checkValidation
];

// LOGIN VALIDATION RULES - Used when any user logs in
const validateLogin = [
    // email must be provided and valid
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address'),

    // password must be provided
    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    // run the validation checker after all rules
    checkValidation
];

module.exports = {
    validateBook,
    validateRegister,
    validateLogin
};
