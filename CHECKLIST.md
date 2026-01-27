# ✅ Setup Checklist

Use this checklist to ensure you've completed all setup steps correctly.

## 📋 Pre-Setup Checklist

- [ ] Node.js v18+ installed (`node --version`)
- [ ] PostgreSQL v14+ installed (`psql --version`)
- [ ] PostgreSQL service is running
- [ ] You have PostgreSQL admin credentials

---

## 🔧 Backend Setup Checklist

### 1. Installation
- [ ] Navigated to `backend` directory
- [ ] Ran `npm install` successfully
- [ ] All dependencies installed without errors

### 2. Configuration
- [ ] Created `.env` file from `.env.example`
- [ ] Set `DB_PASSWORD` to your PostgreSQL password
- [ ] Set `JWT_SECRET` to a strong random string (min 32 characters)
- [ ] Verified `DB_NAME` is set to `lks_translator`
- [ ] Verified `PORT` is set to `5000`
- [ ] Verified `FRONTEND_URL` is set to `http://localhost:5173`

### 3. Database Setup
- [ ] Created PostgreSQL database: `CREATE DATABASE lks_translator;`
- [ ] Verified database exists: `\l` in psql
- [ ] Ran migration: `npm run db:migrate`
- [ ] Migration completed successfully
- [ ] Saw default admin credentials in output

### 4. Backend Server
- [ ] Started backend: `npm run dev`
- [ ] Server started on port 5000
- [ ] No errors in console
- [ ] Tested health endpoint: `http://localhost:5000/health`

---

## 🎨 Frontend Setup Checklist

### 1. Installation
- [ ] Navigated to project root directory
- [ ] Ran `npm install` successfully
- [ ] All dependencies installed without errors

### 2. Configuration
- [ ] Verified `.env.local` exists
- [ ] Verified `VITE_API_URL=http://localhost:5000` is set

### 3. Optional Cleanup
- [ ] (Optional) Removed Supabase package: `npm uninstall @supabase/supabase-js`
- [ ] (Optional) Deleted `lib/supabaseClient.ts`

### 4. Frontend Server
- [ ] Started frontend: `npm run dev`
- [ ] Server started on port 5173
- [ ] No errors in console
- [ ] Can access: `http://localhost:5173`

---

## 🧪 Testing Checklist

### 1. Authentication Tests
- [ ] Opened `http://localhost:5173` in browser
- [ ] Can see Sign In page
- [ ] Logged in with admin credentials:
  - Email: `admin@lks.com`
  - Password: `Admin123!`
- [ ] Login successful
- [ ] Redirected to dashboard/home page
- [ ] Can see user name in header/navbar

### 2. Sign Up Test
- [ ] Clicked "Sign Up" link
- [ ] Filled in registration form with valid data
- [ ] Password meets requirements (8+ chars, uppercase, lowercase, number, special char)
- [ ] Registration successful
- [ ] Automatically logged in
- [ ] Can see new user's name

### 3. API Tests (Optional - using cURL or Postman)
- [ ] Tested login endpoint: `POST /auth/login`
- [ ] Received JWT token in response
- [ ] Tested `/auth/me` with token
- [ ] Received user information

### 4. Translation Test (if applicable)
- [ ] Navigated to translation page
- [ ] Selected source and target languages
- [ ] Uploaded a test file (PDF, DOCX, XLSX, or TXT)
- [ ] File upload successful
- [ ] Job created with status "pending" or "processing"
- [ ] Can view job in history
- [ ] (Wait for completion) Can download translated file

---

## 🔒 Security Checklist

- [ ] Changed default admin password after first login
- [ ] JWT_SECRET is a strong, random string (not the default)
- [ ] Database password is secure
- [ ] `.env` file is in `.gitignore` (not committed to git)
- [ ] No sensitive data in console logs

---

## 📁 File Structure Verification

### Backend Files
- [ ] `backend/src/server.ts` exists
- [ ] `backend/src/controllers/authController.ts` exists
- [ ] `backend/src/controllers/translationController.ts` exists
- [ ] `backend/src/middleware/auth.ts` exists
- [ ] `backend/src/database/db.ts` exists
- [ ] `backend/database/schema.sql` exists
- [ ] `backend/uploads/original/` directory exists
- [ ] `backend/uploads/translated/` directory exists
- [ ] `backend/.env` exists (not committed)
- [ ] `backend/package.json` exists

### Frontend Files
- [ ] `services/AuthService.ts` updated (no Supabase)
- [ ] `services/TranslationService.ts` updated (no Supabase)
- [ ] `contexts/AuthContext.tsx` updated (no Supabase)
- [ ] `.env.local` exists

### Documentation
- [ ] `README.md` exists
- [ ] `SETUP_GUIDE.md` exists
- [ ] `API_REFERENCE.md` exists
- [ ] `IMPLEMENTATION_COMPLETE.md` exists
- [ ] `backend/README.md` exists

---

## 🚨 Troubleshooting Checklist

If something isn't working, check:

### Backend Issues
- [ ] PostgreSQL is running
- [ ] Database credentials in `.env` are correct
- [ ] Database `lks_translator` exists
- [ ] Migration ran successfully
- [ ] Port 5000 is not in use by another application
- [ ] No firewall blocking port 5000

### Frontend Issues
- [ ] Backend server is running
- [ ] `VITE_API_URL` points to correct backend URL
- [ ] No CORS errors in browser console
- [ ] Browser localStorage is not full/corrupted

### Database Issues
- [ ] Can connect to PostgreSQL: `psql -U postgres`
- [ ] Database exists: `\l` shows `lks_translator`
- [ ] Tables exist: `\dt` shows `users` and `translation_jobs`
- [ ] Default admin user exists: `SELECT * FROM users;`

---

## ✅ Final Verification

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Can login with admin credentials
- [ ] Can create new user account
- [ ] Can upload files (if translation feature implemented)
- [ ] No errors in backend console
- [ ] No errors in frontend console
- [ ] No errors in browser console

---

## 🎉 Success!

If all items are checked, you have successfully set up the LKS Multilingual Translator!

### Next Steps:
1. Change the default admin password
2. Customize the translation logic in `backend/src/controllers/translationController.ts`
3. Integrate with actual translation APIs
4. Deploy to production server

---

## 📞 Need Help?

Refer to:
- `SETUP_GUIDE.md` - Detailed setup instructions
- `API_REFERENCE.md` - API documentation
- `backend/README.md` - Backend documentation
- Troubleshooting section in `SETUP_GUIDE.md`

---

**Date Completed:** _______________

**Completed By:** _______________

**Notes:** 
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
