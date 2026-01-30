# Manager Translation Service API Contract

## Service Details
- **Base URL**: http://20.20.20.205:5000
- **API Key**: tr_api_1234567890abcdefghijklmnopqrstuvwxyz
- **Authentication**: X-API-Key header

## Endpoints

### 1. Process Translation
**POST** `/api/process-translation`

**Request Headers:**
```
X-API-Key: tr_api_1234567890abcdefghijklmnopqrstuvwxyz
Content-Type: multipart/form-data
```

**Request Body (FormData):**
- `file`: Document file to translate
- `sourceLanguage`: Source language code
- `targetLanguage`: Target language code
- `documentType`: Type of document

**Response:**
```json
{
  "jobId": "job-12345",
  "status": "completed",
  "progress": 100,
  "translatedFileUrl": "http://localhost:5000/api/download/abc123def456"
}
```

### 2. Get Job Status
**GET** `/api/jobs/{jobId}`

**Request Headers:**
```
X-API-Key: tr_api_1234567890abcdefghijklmnopqrstuvwxyz
```

**Response:**
```json
{
  "jobId": "job-12345",
  "status": "completed",
  "progress": 100,
  "translatedFileUrl": "http://localhost:5000/api/download/abc123def456"
}
```

### 3. Get Translation History
**GET** `/api/jobs`

**Request Headers:**
```
X-API-Key: tr_api_1234567890abcdefghijklmnopqrstuvwxyz
```

**Query Parameters:**
- `limit`: Number of jobs to return (default: 50)
- `offset`: Starting offset (default: 0)

**Response:**
```json
{
  "jobs": [
    {
      "id": "job-12345",
      "sourceLanguage": "en",
      "targetLanguage": "es",
      "documentType": "pdf",
      "originalFilename": "document.pdf",
      "translatedFilename": "document_translated.pdf",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:35:00Z",
      "translatedFileUrl": "http://localhost:5000/api/download/abc123def456"
    }
  ]
}
```

### 4. Download Translated File
**GET** `/api/download/{fileId}`

**Request Headers:**
```
X-API-Key: tr_api_1234567890abcdefghijklmnopqrstuvwxyz
```

**Response:**
- Returns the translated file as binary download

## Status Values
- `pending`: Job queued for processing
- `processing`: Translation in progress
- `completed`: Translation finished successfully
- `failed`: Translation failed

## Error Responses
```json
{
  "error": "Error message describing the issue"
}
```

## Integration Notes
- All requests must include the X-API-Key header
- File uploads use multipart/form-data
- Progress values range from 0-100
- Download URLs are temporary and may expire