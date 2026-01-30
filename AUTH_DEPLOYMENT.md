# Authentication Server Deployment Guide

## Local Development Setup

1. **Install dependencies:**
```bash
npm install express cors bcrypt jsonwebtoken
npm install -g nodemon  # For development
```

2. **Run the server:**
```bash
node auth-server.js
# or for development with auto-reload:
nodemon auth-server.js
```

3. **Test the endpoints:**
```bash
# Health check
curl http://localhost:3001/api/health

# Register a user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123!",
    "name": "Test User",
    "organization": "Lakshmi Sri"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123!"
  }'
```

## Production Deployment Options

### Option 1: Deploy to Your Own Server

1. **Set up environment variables:**
```bash
export PORT=3001
export SECRET_KEY="your-very-secure-secret-key-here"
```

2. **Run with process manager (PM2):**
```bash
npm install -g pm2
pm2 start auth-server.js --name "auth-service"
pm2 startup
pm2 save
```

### Option 2: Deploy to Cloud Platform

**Heroku:**
```bash
# Create Heroku app
heroku create your-auth-service-name

# Set environment variables
heroku config:set SECRET_KEY=your-secure-key-here

# Deploy
git push heroku main
```

**DigitalOcean App Platform:**
1. Create a new app
2. Connect your GitHub repository
3. Set environment variables in the dashboard
4. Deploy automatically

## Environment Variables to Generate

Once deployed, you'll get:
- **VITE_RENDER_AUTH_URL**: Your deployed auth service URL (e.g., https://your-auth-service.herokuapp.com)
- **VITE_RENDER_AUTH_API_KEY**: This can be the same SECRET_KEY or a separate API key you generate

## Security Considerations

1. **Change the SECRET_KEY** in production
2. **Use HTTPS** in production
3. **Add rate limiting** to prevent brute force attacks
4. **Use a real database** instead of in-memory storage
5. **Add input validation** and sanitization
6. **Implement proper error handling**

## Testing with Frontend

Update your .env file:
```bash
VITE_RENDER_AUTH_URL=http://localhost:3001  # or your deployed URL
VITE_RENDER_AUTH_API_KEY=your-secret-key   # same as server SECRET_KEY
```

Then test authentication through your React frontend!