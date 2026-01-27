# LKS Multilingual Translator - Backend API

A self-hosted backend API for document translation with custom JWT authentication and local file storage.

## 🎯 Features

- ✅ **Custom Authentication** - No external dependencies (Supabase, Firebase, etc.)
- ✅ **JWT-based Authorization** - Secure token-based authentication
- ✅ **PostgreSQL Database** - Robust data storage
- ✅ **Local File Storage** - Files stored on server filesystem
- ✅ **Role-based Access Control** - User and Admin roles
- ✅ **Secure File Downloads** - Users can only access their own files
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Error Handling** - Proper error responses

## 📋 Prerequisites

- **Node.js** v18+ 
- **PostgreSQL** v14+ (installed locally)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lks_translator
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,docx,xlsx,txt

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE lks_translator;

# Exit psql
\q
```

### 4. Run Database Migration

```bash
npm run db:migrate
```

This will:
- Create the `users` and `translation_jobs` tables
- Set up indexes and triggers
- Create a default admin user

**Default Admin Credentials:**
- Email: `admin@lks.com`
- Password: `Admin123!`

⚠️ **Change the admin password after first login!**

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication Endpoints

#### 1. Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "user",
  "organization": "Company Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "organization": "Company Name",
      "createdAt": "2024-01-27T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "organization": "Company Name",
      "createdAt": "2024-01-27T10:00:00.000Z",
      "lastLogin": "2024-01-27T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "organization": "Company Name",
      "createdAt": "2024-01-27T10:00:00.000Z",
      "lastLogin": "2024-01-27T10:30:00.000Z"
    }
  }
}
```

### Translation Endpoints

#### 4. Process Translation
```http
POST /api/process-translation
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "sourceLanguage": "en",
  "targetLanguage": "hi",
  "documentType": "pdf",
  "file": <file>
}
```

**Response:**
```json
{
  "success": true,
  "message": "Translation job created successfully",
  "data": {
    "jobId": "uuid",
    "status": "pending"
  }
}
```

#### 5. Get Job Status
```http
GET /api/jobs/:jobId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "uuid",
      "sourceLanguage": "en",
      "targetLanguage": "hi",
      "documentType": "pdf",
      "originalFilename": "document.pdf",
      "translatedFilename": "translated_uuid.pdf",
      "status": "completed",
      "errorMessage": null,
      "createdAt": "2024-01-27T10:00:00.000Z",
      "completedAt": "2024-01-27T10:02:00.000Z",
      "translatedFileUrl": "/api/files/uuid"
    }
  }
}
```

#### 6. Get Translation History
```http
GET /api/jobs?limit=50&offset=0
Authorization: Bearer <token>
```

#### 7. Download Translated File
```http
GET /api/files/:jobId
Authorization: Bearer <token>
```

Returns the translated file as a download.

## 🔒 Security Features

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Secure token generation and verification
- **Input Validation**: All inputs validated using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **File Type Validation**: Only allowed file types accepted
- **File Size Limits**: Maximum 10MB per file
- **Path Traversal Prevention**: Secure file access
- **CORS Protection**: Configured for specific frontend origin
- **Helmet.js**: Security headers
- **User Authorization**: Users can only access their own files

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   └── translationController.ts
│   ├── database/
│   │   ├── db.ts
│   │   └── migrate.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── upload.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   └── translationRoutes.ts
│   └── server.ts
├── database/
│   └── schema.sql
├── uploads/
│   ├── original/
│   └── translated/
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `role` (VARCHAR: 'user' | 'admin')
- `organization` (VARCHAR)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `last_login` (TIMESTAMP)

### Translation Jobs Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `source_language` (VARCHAR)
- `target_language` (VARCHAR)
- `document_type` (VARCHAR)
- `original_filename` (VARCHAR)
- `original_file_path` (VARCHAR)
- `translated_filename` (VARCHAR)
- `translated_file_path` (VARCHAR)
- `status` (VARCHAR: 'pending' | 'processing' | 'completed' | 'failed')
- `error_message` (TEXT)
- `file_size` (BIGINT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `completed_at` (TIMESTAMP)

## 🔧 Frontend Integration

Update your frontend `AuthService.ts` to use the new backend:

```typescript
const API_URL = 'http://localhost:5000';

// Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Store token
localStorage.setItem('token', data.data.token);

// Use token in requests
const response = await fetch(`${API_URL}/api/process-translation`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## 🧪 Testing the API

You can test the API using:

1. **cURL**
2. **Postman**
3. **Thunder Client** (VS Code extension)

Example cURL request:

```bash
# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lks.com","password":"Admin123!"}'

# Get user info
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🚨 Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process: `npx kill-port 5000`

### File Upload Fails
- Check `uploads/` directory exists and has write permissions
- Verify file size is under 10MB
- Ensure file type is allowed

## 📝 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper database credentials
4. Set up SSL/TLS for HTTPS
5. Use a process manager like PM2
6. Set up proper logging
7. Configure firewall rules
8. Regular database backups

## 📄 License

ISC

## 👨‍💻 Support

For issues or questions, please contact the development team.
