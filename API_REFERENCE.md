# 📡 API Reference - Quick Guide

Base URL: `http://localhost:5000`

## 🔐 Authentication Endpoints

### 1. Sign Up

Create a new user account.

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

**Success Response (201):**
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

### 2. Login

Authenticate and receive JWT token.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
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

### 3. Get Current User

Get authenticated user information.

```http
GET /auth/me
Authorization: Bearer <token>
```

**Success Response (200):**
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

---

## 📄 Translation Endpoints

### 4. Process Translation

Upload a document and create a translation job.

```http
POST /api/process-translation
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
  - file: <File>
  - sourceLanguage: "en"
  - targetLanguage: "hi"
  - documentType: "pdf"
```

**Success Response (202):**
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

### 5. Get Job Status

Check the status of a translation job.

```http
GET /api/jobs/:jobId
Authorization: Bearer <token>
```

**Success Response (200):**
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

**Job Statuses:**
- `pending` - Job created, waiting to be processed
- `processing` - Translation in progress
- `completed` - Translation finished successfully
- `failed` - Translation failed (check errorMessage)

### 6. Get Translation History

Get all translation jobs for the authenticated user.

```http
GET /api/jobs?limit=50&offset=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of jobs to return (default: 50)
- `offset` (optional): Number of jobs to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "sourceLanguage": "en",
        "targetLanguage": "hi",
        "documentType": "pdf",
        "originalFilename": "document.pdf",
        "translatedFilename": "translated_uuid.pdf",
        "status": "completed",
        "createdAt": "2024-01-27T10:00:00.000Z",
        "completedAt": "2024-01-27T10:02:00.000Z",
        "translatedFileUrl": "/api/files/uuid"
      }
    ],
    "pagination": {
      "limit": 50,
      "offset": 0,
      "total": 1
    }
  }
}
```

### 7. Download Translated File

Download the translated document.

```http
GET /api/files/:jobId
Authorization: Bearer <token>
```

**Success Response (200):**
Returns the file as a download with appropriate headers.

---

## 🚨 Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes

- **400 Bad Request** - Invalid input or validation error
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists (e.g., duplicate email)
- **500 Internal Server Error** - Server error

---

## 🔒 Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration:** 7 days (configurable in backend `.env`)

---

## 📝 Validation Rules

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### File Upload Limits
- Maximum file size: 10MB
- Allowed file types: pdf, docx, xlsx, txt

### Email Validation
- Must be a valid email format
- Must be unique (no duplicates)

---

## 🧪 Testing with cURL

### Login Example

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lks.com",
    "password": "Admin123!"
  }'
```

### Get User Info Example

```bash
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Upload File Example

```bash
curl -X POST http://localhost:5000/api/process-translation \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/document.pdf" \
  -F "sourceLanguage=en" \
  -F "targetLanguage=hi" \
  -F "documentType=pdf"
```

### Check Job Status Example

```bash
curl -X GET http://localhost:5000/api/jobs/JOB_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Rate Limits

- **Auth endpoints:** 10 requests per 15 minutes per IP
- **API endpoints:** 100 requests per 15 minutes per IP

Exceeding rate limits will result in a 429 (Too Many Requests) response.

---

## 📚 Additional Resources

- Full Backend Documentation: `backend/README.md`
- Setup Guide: `SETUP_GUIDE.md`
- Database Schema: `backend/database/schema.sql`

---

## 💡 Tips

1. **Store the token** in localStorage or sessionStorage on the frontend
2. **Include the token** in all authenticated requests
3. **Handle token expiration** by redirecting to login
4. **Poll job status** every 2-3 seconds until completion
5. **Validate inputs** on the frontend before sending to API
