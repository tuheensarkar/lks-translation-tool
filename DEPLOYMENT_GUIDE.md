# Frontend Deployment to Render (Backend External)

## 🎯 Deployment Strategy

Frontend deployed to Render, backend hosted on company server with API endpoints.

## 🔧 Prerequisites

1. **Frontend**: Ready for Render deployment
2. **Backend**: Must be deployed on company server
3. **VPN Access**: Confirmed working (no firewall issues)
4. **API Endpoints**: Backend must expose the following endpoints:

### Required Backend Endpoints
```
POST   /auth/login              # User login
POST   /auth/signup             # User registration
GET    /auth/me                 # Get current user
POST   /api/process-translation # Submit translation job
GET    /api/jobs                # Get translation history
GET    /api/jobs/:jobId         # Get job status
GET    /api/jobs/:jobId/file    # Download translated file
```

## 🚀 Render Deployment Steps

### 1. Prepare Frontend

```bash
# 1. Update environment variables
# Edit .env file with your company server URL:
VITE_TRANSLATION_BACKEND_URL=https://your-company-server.com/api
VITE_API_URL=https://your-company-server.com/api
VITE_TRANSLATION_API_KEY=tr_api_1234567890abcdefghijklmnopqrstuvwxyz

# 2. Build for production
npm run build
```

### 2. Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `lks-translation-frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_TRANSLATION_BACKEND_URL=https://your-company-server.com/api
     VITE_API_URL=https://your-company-server.com/api
     VITE_TRANSLATION_API_KEY=tr_api_1234567890abcdefghijklmnopqrstuvwxyz
     ```

5. Click "Create Static Site"

### 3. Verify Deployment

After deployment completes:
- Visit your Render site URL
- Test login functionality
- Test translation submission
- Check browser console for API calls

## 🧪 Testing Checklist

### Frontend Tests
- [ ] Login page loads correctly
- [ ] User can register new account
- [ ] User can login with credentials
- [ ] Translation form is accessible
- [ ] File upload works
- [ ] Translation job submission succeeds
- [ ] Job status polling works
- [ ] Translation history loads
- [ ] File download works

### API Integration Tests
- [ ] `POST /auth/login` returns 200
- [ ] `POST /api/process-translation` accepts file upload
- [ ] `GET /api/jobs` returns job list
- [ ] `GET /api/jobs/:jobId` returns job status
- [ ] CORS headers are properly configured

## 🔧 Backend Server Requirements

Your company backend must:

### 1. CORS Configuration
```javascript
// Express.js example
app.use(cors({
  origin: ['https://your-frontend.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
```

### 2. Environment Variables
```env
# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=translation_db
DB_USER=your_user
DB_PASSWORD=your_password

# API Key (must match frontend)
TRANSLATION_API_KEY=tr_api_1234567890abcdefghijklmnopqrstuvwxyz

# Server
PORT=3000
NODE_ENV=production
```

### 3. Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'translation-backend'
  });
});
```

## 📊 Monitoring

### Frontend (Render)
- Dashboard: https://dashboard.render.com/
- Logs: Available in Render dashboard
- Metrics: Bandwidth, requests, build status

### Backend (Company Server)
- Implement logging for API requests
- Monitor database connections
- Track translation job processing
- Set up health check monitoring

## 🔒 Security Considerations

1. **API Key**: Keep `VITE_TRANSLATION_API_KEY` secure
2. **CORS**: Only allow your Render frontend domain
3. **HTTPS**: Ensure backend uses HTTPS in production
4. **Rate Limiting**: Implement on backend to prevent abuse
5. **Input Validation**: Validate all file uploads and parameters

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```
   Error: Access to fetch at 'https://your-company-server.com/api/auth/login' 
   from origin 'https://your-frontend.onrender.com' has been blocked by CORS policy
   ```
   **Solution**: Update backend CORS configuration to allow Render domain

2. **404 on API Calls**
   ```
   POST https://your-company-server.com/api/auth/login 404
   ```
   **Solution**: Verify backend routes match frontend expectations

3. **File Upload Failures**
   ```
   Error: Request failed with status code 413
   ```
   **Solution**: Increase file size limits on backend

4. **Authentication Issues**
   ```
   Error: No authentication token found
   ```
   **Solution**: Verify `VITE_TRANSLATION_API_KEY` matches backend

### Debug Commands

```bash
# Test backend connectivity from local machine
curl -X GET https://your-company-server.com/health

# Test login endpoint
curl -X POST https://your-company-server.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Check frontend build
npm run build
```

## 🔄 Update Process

To update frontend:
1. Push changes to GitHub
2. Render auto-deploys on push to main branch
3. Monitor deployment logs

To update backend:
1. Deploy to company server
2. Update `VITE_TRANSLATION_BACKEND_URL` if URL changes
3. Redeploy frontend if needed

## 📞 Support

For issues:
1. Check Render dashboard logs
2. Verify backend server logs
3. Test API endpoints directly
4. Contact IT team for server access issues