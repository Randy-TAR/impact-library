# 📚 Impact Library — Backend API

A digital library platform where librarians upload PDF books and the public can browse, search, and download them freely — no account needed.

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Auth | JWT (JSON Web Tokens) |
| Password Hashing | bcrypt |
| File Uploads | Multer |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                  # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT verification + role checking
│   │   └── uploadMiddleware.js    # Multer file upload config
│   ├── models/
│   │   ├── bookModel.js           # Book DB functions
│   │   └── userModel.js           # User DB functions
│   ├── routes/
│   │   ├── bookRoutes.js          # Book API endpoints
│   │   ├── userRoutes.js          # User/auth endpoints
│   │   └── dashboardRoutes.js     # Dashboard stats endpoint
│   ├── uploads/                   # Stored PDF files
│   └── app.js                     # Express entry point
└── package.json
```

---

## ⚙️ Prerequisites

Make sure these are installed on your machine:

```bash
# Check Node.js
node -v        # should be v18+

# Check npm
npm -v

# Check PostgreSQL
psql --version

# Check nodemon (optional but recommended)
nodemon -v
```

---

## 🚀 Getting Started

### 1. Clone and Install Dependencies

```bash
# Navigate to backend folder
cd backend

# Install all dependencies
npm install
```

### 2. Set Up the Database

```bash
# Open PostgreSQL
psql -U randytar -d postgres

# Create the database
CREATE DATABASE impact_library_db;

# Connect to it
\c impact_library_db
```

Then create the tables:

```sql
-- Books table
CREATE TABLE books (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    author          VARCHAR(255) NOT NULL,
    category        VARCHAR(100),
    description     TEXT,
    file_path       VARCHAR(500),
    file_size       VARCHAR(50),
    format          VARCHAR(20) DEFAULT 'PDF',
    download_count  INTEGER DEFAULT 0,
    uploaded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (admin/librarian only)
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'librarian'
                CHECK (role IN ('admin', 'librarian')),
    contact     VARCHAR(20),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE books TO randytar;
GRANT ALL PRIVILEGES ON TABLE users TO randytar;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE books_id_seq TO randytar;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE users_id_seq TO randytar;
```

### 3. Create the First Admin User

Generate a bcrypt hash for your password:

```bash
# From backend/ folder
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('yourpassword', 10).then(h => console.log(h));"
```

Copy the hash and insert the admin:

```sql
INSERT INTO users (name, email, password, role, contact)
VALUES (
    'Your Name',
    'admin@impactlib.com',
    'PASTE_HASH_HERE',
    'admin',
    '670000000'
);
```

### 4. Start the Server

```bash
# From backend/src/ folder
nodemon app.js

# OR without nodemon
node app.js
```

**Expected output:**
```
🚀 Server is running on http://localhost:3000
✅ Success: Connected to impact_library_db
🕒 Database Time: 2026-xx-xx...
```

---

## 🔑 Authentication

The system uses **JWT tokens** for protected routes.

- Tokens expire after **4 hours**
- Include token in every protected request header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### User Roles

| Role | Can Do |
|---|---|
| `admin` | Everything — manage users, upload, delete books |
| `librarian` | Upload books, view records, view dashboard |
| Public | Browse books, search, download (no login needed) |

---

## 🧪 Testing the API

You can test using **Postman** or any API client.

---

### Step 1 — Login and Get Token

```
Method:  POST
URL:     http://localhost:3000/api/users/login
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "randy@impactlib.com",
  "password": "password"
}
```

**Success Response:**
```json
{
  "message": "Login Successfull",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Your Name",
    "role": "admin"
  }
}
```

> ⚠️ Copy the token — you will need it for all protected routes below.

---

### Step 2 — Upload a Book

```
Method:  POST
URL:     http://localhost:3000/api/books
Headers: Authorization: Bearer YOUR_TOKEN_HERE
Body:    form-data (NOT JSON)
```

| Field | Type | Value |
|---|---|---|
| title | Text | The Alchemist |
| author | Text | Paulo Coelho |
| category | Text | Fiction |
| description | Text | A journey of self-discovery |
| file | File | [select a PDF file] |

> ⚠️ In Postman: Body → form-data → change `file` field type from Text to **File**

**Success Response:**
```json
{
  "message": "Book uploaded successfully",
  "book": {
    "id": 1,
    "title": "The Alchemist",
    "author": "Paulo Coelho",
    "category": "Fiction",
    "file_size": "1.23 MB",
    "format": "PDF",
    "download_count": 0
  }
}
```

---

### Step 3 — Get All Books (Public)

```
Method:  GET
URL:     http://localhost:3000/api/books
Headers: none
Body:    none
```

**Success Response:**
```json
[
  {
    "id": 1,
    "title": "The Alchemist",
    "author": "Paulo Coelho",
    "category": "Fiction",
    "file_size": "1.23 MB",
    "download_count": 0,
    "uploaded_at": "2026-04-10T..."
  }
]
```

---

### Step 4 — Get Single Book (Public)

```
Method:  GET
URL:     http://localhost:3000/api/books/1
Headers: none
```

---

### Step 5 — Search Books (Public)

```
Method:  GET
URL:     http://localhost:3000/api/books/search?keyword=alchemist
Headers: none
```

> Searches by title, author, or category. Case-insensitive.

---

### Step 6 — Download a Book (Public)

```
Method:  GET
URL:     http://localhost:3000/api/books/download/1
Headers: none
```

> PDF file downloads automatically. Download count increments by 1.

---

### Step 7 — Update Book Metadata

```
Method:  PUT
URL:     http://localhost:3000/api/books/1
Headers:
  Content-Type:  application/json
  Authorization: Bearer YOUR_TOKEN_HERE
Body (raw JSON):
{
  "title": "The Alchemist",
  "author": "Paulo Coelho",
  "category": "Christian Fiction",
  "description": "Updated description here",
  "format": "PDF"
}
```

---

### Step 8 — Delete a Book (Admin Only)

```
Method:  DELETE
URL:     http://localhost:3000/api/books/1
Headers: Authorization: Bearer YOUR_TOKEN_HERE
```

> Deletes both the database record AND the PDF file from /uploads

---

### Step 9 — Dashboard Statistics

```
Method:  GET
URL:     http://localhost:3000/api/dashboard
Headers: Authorization: Bearer YOUR_TOKEN_HERE
```

**Success Response:**
```json
{
  "total_books": 5,
  "total_downloads": 23,
  "top_books": [...],
  "books_by_category": [...],
  "recent_uploads": [...],
  "users": [...]
}
```

---

### Step 10 — Register a New Librarian (Admin Only)

```
Method:  POST
URL:     http://localhost:3000/api/users/register
Headers:
  Content-Type:  application/json
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Body (raw JSON):
{
  "name": "John Librarian",
  "email": "john@impactlib.com",
  "password": "librarian123",
  "role": "librarian",
  "contact": "671000001"
}
```

---

## 📋 Full API Reference

### Books — `/api/books`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/books` | Public | Get all books |
| GET | `/api/books/search?keyword=` | Public | Search books |
| GET | `/api/books/:id` | Public | Get single book |
| GET | `/api/books/download/:id` | Public | Download PDF |
| POST | `/api/books` | Librarian, Admin | Upload new book |
| PUT | `/api/books/:id` | Librarian, Admin | Update book info |
| DELETE | `/api/books/:id` | Admin only | Delete book + file |

### Users — `/api/users`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/users/login` | Public | Login + get token |
| POST | `/api/users/register` | Admin only | Register new user |
| GET | `/api/users` | Public | Get all users |

### Dashboard — `/api/dashboard`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard` | Admin, Librarian | Get system stats |

---

## ❌ Common Error Responses

| Status | Message | Cause |
|---|---|---|
| 400 | `"Please upload a PDF file"` | No file attached |
| 401 | `"Invalid or expired token"` | Bad/expired JWT |
| 403 | `"No token provided"` | Missing Authorization header |
| 403 | `"Access denied. Required role: admin"` | Wrong role for route |
| 404 | `"Book not found"` | Invalid book ID |
| 404 | `"User not found"` | Email not in DB |
| 500 | `"Failed to upload book"` | Server/DB error |

---

## 📦 Dependencies

```json
{
  "bcrypt": "^6.0.0",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "multer": "^1.4.5",
  "pg": "^8.20.0"
}
```

Install all:
```bash
npm install
```

---

## 👨‍💻 Author

**Randy TAR**
Impact Library — Backend API v1.0
