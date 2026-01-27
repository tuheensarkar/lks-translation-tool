# 🚀 Complete Setup Guide - LKS Multilingual Translator

This guide will walk you through setting up the complete application with custom authentication and local file storage.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Testing the Application](#testing-the-application)
5. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

### Required Software

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v14 or higher ([Download](https://www.postgresql.org/download/))
- **Git** (optional, for version control)

### Verify Installation

```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
psql --version  # Should show PostgreSQL 14 or higher
```

---

## 2. Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js
- PostgreSQL driver
- bcrypt for password hashing
- jsonwebtoken for JWT authentication
- multer for file uploads
- And more...

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lks_translator
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE

# JWT Configuration (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,docx,xlsx,txt

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Important:** Replace `YOUR_POSTGRES_PASSWORD_HERE` with your actual PostgreSQL password.

### Step 4: Create PostgreSQL Database

Open PostgreSQL command line:

```bash
# Windows
psql -U postgres

# Mac/Linux
sudo -u postgres psql
```

Create the database:

```sql
CREATE DATABASE lks_translator;

-- Verify it was created
\l

-- Exit psql
\q
```

### Step 5: Run Database Migration

This will create all necessary tables and insert a default admin user:

```bash
npm run db:migrate
```

You should see:

```
✅ Database migration completed successfully!

📝 Default admin credentials:
   Email: admin@lks.com
   Password: Admin123!

⚠️  Please change the admin password after first login!
```

### Step 6: Start the Backend Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm run build
npm start
```

You should see:

```
✅ Database connection established

🚀 Server is running on port 5000
📍 Health check: http://localhost:5000/health
🔐 Auth endpoints: http://localhost:5000/auth
📄 API endpoints: http://localhost:5000/api

⚡ Environment: development
```

### Step 7: Test the Backend

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:5000/health
```

You should get:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-27T10:00:00.000Z"
}
```

---

## 3. Frontend Setup

### Step 1: Navigate to Frontend Directory

Open a new terminal window and navigate to the project root:

```bash
cd ..  # If you're in the backend directory
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Configure Frontend Environment

The `.env.local` file should already exist with:

```env
VITE_API_URL=http://localhost:5000
```

If it doesn't exist, create it with the above content.

### Step 4: Remove Supabase Dependencies (Optional)

Since we're no longer using Supabase, you can remove it:

```bash
npm uninstall @supabase/supabase-js
```

And delete the Supabase client file:

```bash
# Windows
del lib\supabaseClient.ts

# Mac/Linux
rm lib/supabaseClient.ts
```

### Step 5: Start the Frontend

```bash
npm run dev
```

You should see:

```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## 4. Testing the Application

### Test 1: Sign In with Admin Account

1. Open your browser and go to `http://localhost:5173`
2. Click "Sign In"
3. Use the default admin credentials:
   - Email: `admin@lks.com`
   - Password: `Admin123!`
4. You should be logged in successfully

### Test 2: Create a New User Account

1. Click "Sign Up"
2. Fill in the form:
   - Name: Your Name
   - Email: your.email@example.com
   - Password: Must contain uppercase, lowercase, number, and special character (min 8 chars)
   - Organization: Your Company
3. Click "Sign Up"
4. You should be automatically logged in

### Test 3: Upload a Document for Translation

1. After logging in, navigate to the translation page
2. Select source and target languages
3. Choose a document (PDF, DOCX, XLSX, or TXT)
4. Click "Translate"
5. The job should be created and start processing

### Test 4: Download Translated Document

1. Wait for the translation to complete
2. Click the download button
3. The translated file should download to your computer

---

## 5. Troubleshooting

### Backend Issues

#### Problem: "Database connection failed"

**Solution:**
- Ensure PostgreSQL is running
- Check your database credentials in `.env`
- Verify the database exists: `psql -U postgres -l`

#### Problem: "Port 5000 already in use"

**Solution:**
- Change the `PORT` in `.env` to another port (e.g., 5001)
- Or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -ti:5000 | xargs kill -9
  ```

#### Problem: "JWT_SECRET is not defined"

**Solution:**
- Make sure you have a `.env` file in the `backend` directory
- Ensure `JWT_SECRET` is set to a strong, random string

#### Problem: "File upload fails"

**Solution:**
- Check that `backend/uploads/original` and `backend/uploads/translated` directories exist
- Verify file size is under 10MB
- Ensure file type is one of: pdf, docx, xlsx, txt

### Frontend Issues

#### Problem: "Network Error" or "Failed to fetch"

**Solution:**
- Ensure the backend server is running on port 5000
- Check that `VITE_API_URL` in `.env.local` is correct
- Verify CORS is properly configured in the backend

#### Problem: "Authentication failed"

**Solution:**
- Clear your browser's localStorage
- Try logging in again
- Check browser console for detailed error messages

#### Problem: "Module not found" errors

**Solution:**
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  ```

### Database Issues

#### Problem: "relation 'users' does not exist"

**Solution:**
- Run the migration again:
  ```bash
  cd backend
  npm run db:migrate
  ```

#### Problem: "password authentication failed"

**Solution:**
- Check your PostgreSQL password in `.env`
- Reset PostgreSQL password if needed:
  ```sql
  ALTER USER postgres PASSWORD 'new_password';
  ```

---

## 📝 Additional Notes

### Default Admin Credentials

- **Email:** admin@lks.com
- **Password:** Admin123!

**⚠️ IMPORTANT:** Change this password immediately after first login!

### API Endpoints

All API endpoints are documented in `backend/README.md`

### Security Considerations

1. **Change JWT_SECRET** in production to a strong, random string
2. **Use HTTPS** in production
3. **Set strong passwords** for all users
4. **Regular backups** of the PostgreSQL database
5. **Update dependencies** regularly for security patches

### File Storage

- Original files: `backend/uploads/original/`
- Translated files: `backend/uploads/translated/`
- Make sure to backup these directories regularly

### Database Backups

Create regular backups:

```bash
# Backup
pg_dump -U postgres lks_translator > backup.sql

# Restore
psql -U postgres lks_translator < backup.sql
```

---

## 🎉 Success!

If you've completed all steps successfully, you now have a fully functional document translation system with:

✅ Custom authentication (no external dependencies)
✅ JWT-based authorization
✅ Local file storage
✅ PostgreSQL database
✅ Secure API endpoints
✅ Role-based access control

For any issues or questions, please refer to the troubleshooting section or check the logs in the terminal.

---

## 📚 Next Steps

1. **Customize the translation logic** in `backend/src/controllers/translationController.ts`
2. **Integrate with actual translation APIs** (Google Translate, DeepL, etc.)
3. **Add email notifications** for completed translations
4. **Implement password reset** functionality
5. **Add more file type support**
6. **Deploy to production** server

Happy coding! 🚀
