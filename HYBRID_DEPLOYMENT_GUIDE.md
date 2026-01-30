# Hybrid Deployment Configuration Guide

## Current Architecture
- **Frontend**: Deployed on Render
- **Authentication**: Hosted on your system
- **Translation Service**: Hosted on manager's system

## Required Configuration

### 1. Update Your .env File
Replace the placeholder values with your actual system information:

```bash
# Authentication Service (Your System)
VITE_RENDER_AUTH_URL=http://your-actual-system-ip:port
VITE_RENDER_AUTH_API_KEY=your-actual-auth-key

# Translation Service (Manager's System)  
VITE_TRANSLATION_BACKEND_URL=http://20.20.20.205:5000
VITE_TRANSLATION_API_KEY=tr_api_1234567890abcdefghijklmnopqrstuvwxyz

# Legacy compatibility
VITE_API_URL=http://20.20.20.205:5000
```

### 2. Render Dashboard Configuration
In your Render dashboard, set these environment variables:
- `VITE_RENDER_AUTH_URL` = your system URL
- `VITE_RENDER_AUTH_API_KEY` = your auth API key
- `VITE_TRANSLATION_BACKEND_URL` = http://20.20.20.205:5000
- `VITE_TRANSLATION_API_KEY` = tr_api_1234567890abcdefghijklmnopqrstuvwxyz

### 3. Your System (Authentication) Requirements
Set up these endpoints:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/verify`

Add CORS configuration:
```javascript
app.use(cors({
  origin: [
    'https://your-render-app.onrender.com',
    'http://localhost:3000'
  ]
}));
```

### 4. Manager's System (Translation) Requirements
Ensure these endpoints are available:
- `POST /api/process-translation`
- `GET /api/jobs`
- `GET /api/jobs/{jobId}`
- `GET /api/download/{fileId}`

Add CORS configuration:
```javascript
app.use(cors({
  origin: [
    'https://your-render-app.onrender.com',
    'http://localhost:3000'
  ]
}));
```

## Deployment Steps

1. **Configure your system** with the auth endpoints and CORS
2. **Configure manager's system** with translation endpoints and CORS
3. **Update .env file** with actual URLs and API keys
4. **Deploy to Render** with the updated configuration
5. **Test the integration** by signing in and translating documents

## Testing
- Authentication requests will go to your system
- Translation requests will go to manager's system
- Both should work seamlessly through the Render frontend