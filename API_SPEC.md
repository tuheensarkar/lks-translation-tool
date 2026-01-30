# Backend API Specification

## Base URL
```
https://your-company-server.com/api
```

## Authentication
All API requests require the `X-API-Key` header:
```
X-API-Key: tr_api_1234567890abcdefghijklmnopqrstuvwxyz
```

## Endpoints

### Authentication

#### POST `/auth/login`
User login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "organization": "Company Name",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

#### POST `/auth/signup`
User registration

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "name": "John Doe",
  "organization": "Company Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "organization": "Company Name",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  },
  "message": "Registration successful"
}
```

#### GET `/auth/me`
Get current user info

**Headers:**
```
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "organization": "Company Name",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Translation

#### POST `/api/process-translation`
Submit document for translation

**Request:**
```bash
curl -X POST https://your-company-server.com/api/process-translation \
  -H "X-API-Key: tr_api_1234567890abcdefghijklmnopqrstuvwxyz" \
  -F "file=@document.pdf" \
  -F "sourceLanguage=en" \
  -F "targetLanguage=fr" \
  -F "documentType=general"
```

**Form Fields:**
- `file`: The document to translate (multipart/form-data)
- `sourceLanguage`: Source language code (e.g., "en", "es", "fr")
- `targetLanguage`: Target language code (e.g., "es", "fr", "de")
- `documentType`: Type of document (e.g., "general", "technical", "legal")

**Response:**
```json
{
  "success": true,
  "data": {
    "jobId": "job_uuid",
    "status": "processing",
    "progress": 0,
    "message": "Translation job submitted"
  }
}
```

#### GET `/api/jobs`
Get translation history

**Query Parameters:**
- `limit` (optional): Number of jobs to return (default: 50)
- `offset` (optional): Number of jobs to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job_uuid",
        "sourceLanguage": "en",
        "targetLanguage": "fr",
        "documentType": "general",
        "originalFilename": "document.pdf",
        "translatedFilename": "document_fr.pdf",
        "status": "completed",
        "createdAt": "2024-01-01T00:00:00Z",
        "completedAt": "2024-01-01T00:05:00Z",
        "translatedFileUrl": "/api/jobs/job_uuid/file"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 50,
      "offset": 0
    }
  }
}
```

#### GET `/api/jobs/{jobId}`
Get job status

**Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job_uuid",
      "sourceLanguage": "en",
      "targetLanguage": "fr",
      "documentType": "general",
      "originalFilename": "document.pdf",
      "translatedFilename": "document_fr.pdf",
      "status": "completed",
      "progress": 100,
      "createdAt": "2024-01-01T00:00:00Z",
      "completedAt": "2024-01-01T00:05:00Z",
      "translatedFileUrl": "/api/jobs/job_uuid/file"
    }
  }
}
```

#### GET `/api/jobs/{jobId}/file`
Download translated file

**Response:**
- Content-Type: `application/pdf` (or appropriate file type)
- Content-Disposition: `attachment; filename="translated_document.pdf"`
- Binary file content

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid input parameters",
  "message": "Source language is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or missing API key"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Job not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Translation service temporarily unavailable"
}
```

## Health Check

#### GET `/health`
System health status

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "translation-backend",
  "version": "1.0.0"
}
```

## Supported Languages

### Language Codes
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `zh` - Chinese
- `ja` - Japanese
- `ko` - Korean
- `ar` - Arabic
- `ru` - Russian

## Supported Document Types
- `general` - General documents
- `technical` - Technical documentation
- `legal` - Legal documents
- `medical` - Medical documents
- `financial` - Financial documents

## Rate Limits
- 100 requests per minute per API key
- 10 file uploads per minute per API key
- 1GB total file size per day per API key

## CORS Configuration
The backend should allow requests from your Render frontend domain:
```
Access-Control-Allow-Origin: https://your-frontend.onrender.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key
Access-Control-Allow-Credentials: true
```