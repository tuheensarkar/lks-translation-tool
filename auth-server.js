// auth-server.js - Basic Authentication Server Implementation

import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 10000;
const SECRET_KEY = process.env.VITE_RENDER_AUTH_API_KEY || 'your-secret-key-change-this-in-production';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://lks_translation_user:GveKC3YAYidizrPdgGkXE1AvQW1f5OT1@dpg-d5s9mnffte5s73co24ag-a.virginia-postgres.render.com/lks_translation',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Middleware
app.use(cors({
  origin: [
    'https://lks-translation-frontend.onrender.com',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Initialize database tables
async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'client',
        organization VARCHAR(255) DEFAULT 'Lakshmi Sri',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize database when server starts
initializeDatabase();

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    }, 
    SECRET_KEY, 
    { expiresIn: '24h' }
  );
};

const verifyToken = async (token) => {
  try {
    // First check if token is blacklisted
    const result = await pool.query(
      'SELECT token FROM token_blacklist WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    
    if (result.rows.length > 0) {
      // Token is blacklisted
      return null;
    }
    
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};

// Authentication Routes

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user from database
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    console.log('Comparing password for user:', user.email);
    console.log('Stored hash:', user.password_hash);
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', isValidPassword);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        createdAt: user.created_at,
        lastLogin: user.last_login
      },
      token: token,
      message: 'Login successful'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, organization } = req.body;
    
    // Check if user exists in database
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'User already exists' 
      });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user in database
    const newUserResult = await pool.query(
      'INSERT INTO users (email, password_hash, name, organization) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, name, organization || 'Lakshmi Sri']
    );
    
    const newUser = newUserResult.rows[0];
    
    // Generate token
    const token = generateToken(newUser);
    
    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        organization: newUser.organization,
        createdAt: newUser.created_at,
        lastLogin: newUser.last_login
      },
      token: token,
      message: 'Registration successful'
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Initialize token blacklist table
async function initializeBlacklistTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Token blacklist table initialized successfully');
  } catch (error) {
    console.error('Error initializing token blacklist table:', error);
  }
}

// Initialize blacklist table when server starts
initializeBlacklistTable();

// POST /api/auth/logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify the token to get its expiration time
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Calculate the token's original expiration time
    const tokenExpiration = new Date(decoded.exp * 1000);
    
    // Add the token to the blacklist
    await pool.query(
      'INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2)',
      [token, tokenExpiration]
    );
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Find user from database
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1 AND is_active = true', [decoded.userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// POST /api/auth/verify
app.post('/api/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.json({
      payload: decoded,
      message: 'Token is valid'
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// Debug endpoint to check user data (REMOVE IN PRODUCTION)
app.get('/api/debug/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, password_hash FROM users');
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint with database test
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      timestamp: new Date(),
      db: 'Connected',
      db_time: result.rows[0].now
    });
  } catch (error) {
    res.json({ 
      status: 'OK', 
      timestamp: new Date(),
      db: 'Error',
      db_error: error.message
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Authentication server running on port ${PORT} - v2`);
  console.log(`Access URLs:`);
  console.log(`- Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`- Register: http://localhost:${PORT}/api/auth/register`);
  console.log(`- Health: http://localhost:${PORT}/api/health`);
});