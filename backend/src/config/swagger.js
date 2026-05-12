const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

// Swagger definition — describes the entire API
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: '📚 Impact Library API',
        version: '1.0.0',
        description: `
## Impact Library — REST API Documentation

A digital library platform where librarians upload PDF books 
and the public can browse, search, and download them freely.

### Authentication
Protected routes require a **JWT Bearer token**.
Login first at \`POST /api/users/login\` to get your token,
then click **Authorize** and enter: \`Bearer YOUR_TOKEN_HERE\`

### User Roles
| Role | Access |
|------|--------|
| \`user\` | Public — registered but no special access |
| \`librarian\` | Upload books, view records, dashboard |
| \`admin\` | Full access — manage users, delete books |
        `,
        contact: {
            name: 'Randy TAR',
            email: 'dev@impactlibrary.org'
        }
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development Server'
        }
    ],
    components: {
        securitySchemes: {
            // defines the Bearer token auth for Swagger UI
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token from the login endpoint'
            }
        },
        schemas: {
            // reusable book schema
            Book: {
                type: 'object',
                properties: {
                    id:             { type: 'integer',  example: 1 },
                    title:          { type: 'string',   example: 'The Alchemist' },
                    author:         { type: 'string',   example: 'Paulo Coelho' },
                    category:       { type: 'string',   example: 'Fiction' },
                    description:    { type: 'string',   example: 'A journey of self-discovery' },
                    file_path:      { type: 'string',   example: 'uploads/1234-book.pdf' },
                    file_size:      { type: 'string',   example: '2.34 MB' },
                    format:         { type: 'string',   example: 'PDF' },
                    download_count: { type: 'integer',  example: 42 },
                    uploaded_at:    { type: 'string',   example: '2026-04-10T10:00:00Z' }
                }
            },
            // reusable user schema
            User: {
                type: 'object',
                properties: {
                    id:         { type: 'integer', example: 1 },
                    name:       { type: 'string',  example: 'Randy Admin' },
                    email:      { type: 'string',  example: 'randy@impactlib.com' },
                    role:       { type: 'string',  enum: ['admin', 'librarian', 'user'] },
                    contact:    { type: 'string',  example: '670000000' },
                    created_at: { type: 'string',  example: '2026-04-01T00:00:00Z' }
                }
            },
            // reusable error schema
            Error: {
                type: 'object',
                properties: {
                    error:   { type: 'string', example: 'Something went wrong' },
                    details: { type: 'string', example: 'More details here' }
                }
            }
        }
    }
};

// options for swagger-jsdoc — tells it where to find JSDoc comments
const options = {
    swaggerDefinition,
    apis: [path.join(__dirname, '../routes/*.js')] // scans all route files for swagger comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;