# 🌍 LKS Multilingual Translator

A secure, self-hosted document translation system with custom authentication and local file storage.

## ✨ Features

### 🔐 Security
- ✅ **Custom JWT Authentication** - No external auth dependencies
- ✅ **Bcrypt Password Hashing** - Industry-standard password security
- ✅ **Role-Based Access Control** - User and Admin roles
- ✅ **Secure File Access** - Users can only access their own files
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **Rate Limiting** - Protection against brute force attacks

### 📁 File Management
- ✅ **Local File Storage** - Files stored on server filesystem
- ✅ **Multiple File Types** - Support for PDF, DOCX, XLSX, TXT
- ✅ **File Size Limits** - Configurable maximum file size
- ✅ **Secure Downloads** - Authorization-protected file access

### 🗄️ Database
- ✅ **PostgreSQL** - Robust relational database
- ✅ **Automated Migrations** - Easy database setup
- ✅ **Transaction Support** - Data integrity guaranteed
- ✅ **Indexed Queries** - Optimized performance

### 🌐 API
- ✅ **RESTful Design** - Clean, predictable endpoints
- ✅ **JWT Authorization** - Secure token-based auth
- ✅ **Error Handling** - Consistent error responses
- ✅ **CORS Support** - Configured for frontend integration

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│                    (React + TypeScript)                     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  SignIn  │  │  SignUp  │  │  Upload  │  │ History  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              AuthService & TranslationService        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │ JWT Authentication
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│                  (Node.js + Express + TypeScript)           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Middleware                        │  │
│  │  • Authentication (JWT)                              │  │
│  │  • Validation (express-validator)                    │  │
│  │  • File Upload (multer)                              │  │
│  │  • Rate Limiting                                     │  │
│  │  • CORS & Helmet (security)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌────────────────────┐  ┌────────────────────────────┐   │
│  │  Auth Controller   │  │  Translation Controller    │   │
│  │  • signup          │  │  • processTranslation      │   │
│  │  • login           │  │  • getJobStatus            │   │
│  │  • me              │  │  • getHistory              │   │
│  └────────────────────┘  │  • downloadFile            │   │
│                          └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │   PostgreSQL     │  │  Local Storage   │
         │                  │  │                  │
         │  • users         │  │  /uploads/       │
         │  • translation_  │  │    original/     │
         │    jobs          │  │    translated/   │
         └──────────────────┘  └──────────────────┘
```

## 📂 Project Structure

```
lks-multilingual-translator/
├── backend/                          # Backend API server
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts     # Authentication logic
│   │   │   └── translationController.ts  # Translation logic
│   │   ├── database/
│   │   │   ├── db.ts                 # Database connection
│   │   │   └── migrate.ts            # Migration script
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT middleware
│   │   │   ├── validation.ts         # Input validation
│   │   │   └── upload.ts             # File upload handling
│   │   ├── routes/
│   │   │   ├── authRoutes.ts         # Auth endpoints
│   │   │   └── translationRoutes.ts  # Translation endpoints
│   │   └── server.ts                 # Express server
│   ├── database/
│   │   └── schema.sql                # Database schema
│   ├── uploads/                      # File storage
│   │   ├── original/                 # Original files
│   │   └── translated/               # Translated files
│   ├── .env                          # Environment variables
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── services/                         # Frontend services
│   ├── AuthService.ts                # Authentication service
│   └── TranslationService.ts         # Translation service
│
├── contexts/                         # React contexts
│   └── AuthContext.tsx               # Auth state management
│
├── pages/                            # React pages
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   └── ...
│
├── components/                       # React components
│   └── ...
│
├── SETUP_GUIDE.md                    # Complete setup instructions
├── API_REFERENCE.md                  # API documentation
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL v14+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lks-multilingual-translator
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run db:migrate
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ..
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

### Default Credentials
- Email: `admin@lks.com`
- Password: `Admin123!`

**⚠️ Change this password after first login!**

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Detailed setup instructions
- **[API Reference](API_REFERENCE.md)** - Complete API documentation
- **[Backend README](backend/README.md)** - Backend-specific documentation

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lks_translator
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,docx,xlsx,txt

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000
```

## 🔐 Security Features

1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Strong password requirements enforced
   - No plaintext password storage

2. **JWT Authentication**
   - Secure token generation
   - Token expiration (7 days default)
   - Token verification on every request

3. **Input Validation**
   - Email format validation
   - Password strength validation
   - File type and size validation
   - SQL injection prevention

4. **Authorization**
   - Role-based access control
   - User can only access own files
   - Admin role for elevated permissions

5. **Rate Limiting**
   - Auth endpoints: 10 req/15min
   - API endpoints: 100 req/15min

6. **Security Headers**
   - Helmet.js for HTTP headers
   - CORS configuration
   - XSS protection

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    organization VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### Translation Jobs Table
```sql
CREATE TABLE translation_jobs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    document_type VARCHAR(20) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    original_file_path VARCHAR(1000) NOT NULL,
    translated_filename VARCHAR(500),
    translated_file_path VARCHAR(1000),
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

## 🧪 Testing

### Test Authentication
```bash
# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lks.com","password":"Admin123!"}'

# Get user info
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test File Upload
```bash
curl -X POST http://localhost:5000/api/process-translation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "sourceLanguage=en" \
  -F "targetLanguage=hi" \
  -F "documentType=pdf"
```

## 🚨 Troubleshooting

See [SETUP_GUIDE.md](SETUP_GUIDE.md#5-troubleshooting) for common issues and solutions.

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **File Upload:** multer
- **Validation:** express-validator
- **Security:** helmet, cors, express-rate-limit

### Frontend
- **Framework:** React
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router
- **Icons:** Lucide React

## 📝 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Translation
- `POST /api/process-translation` - Upload and translate document
- `GET /api/jobs/:jobId` - Get job status
- `GET /api/jobs` - Get translation history
- `GET /api/files/:jobId` - Download translated file

## 🎯 Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Real-time translation progress updates (WebSockets)
- [ ] Integration with translation APIs (Google Translate, DeepL)
- [ ] Batch translation support
- [ ] Translation memory
- [ ] User preferences and settings
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Multi-language UI support

## 📄 License

ISC

## 👥 Support

For issues, questions, or contributions, please contact the development team.

---

**Built with ❤️ for secure, self-hosted document translation**