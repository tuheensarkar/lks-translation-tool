import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../database/db.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';

// Register new user
export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role = 'user', organization = '' } = req.body;

        // Check if user already exists
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists',
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await query(
            `INSERT INTO users (name, email, password_hash, role, organization)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, organization, created_at`,
            [name, email, passwordHash, role, organization]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organization: user.organization,
                    createdAt: user.created_at,
                },
                token,
            },
        });
    } catch (error) {
        console.error('Signup error:', error);
        console.dir(error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
        });
    }
};

// Login user
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log(`[Login] Attempt for email: ${email}`);

        // Find user by email
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log(`[Login] No user found for: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const user = result.rows[0];
        console.log(`[Login] User found: ${user.id}, Active: ${user.is_active}`);

        if (!user.is_active) {
            console.log(`[Login] User is inactive: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated',
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        console.log(`[Login] Password valid: ${isPasswordValid}`);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Update last login
        await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organization: user.organization,
                    createdAt: user.created_at,
                    lastLogin: user.last_login || new Date(),
                },
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
        });
    }
};

// Get current user info
export const me = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
        }

        const result = await query(
            'SELECT id, name, email, role, organization, created_at, last_login FROM users WHERE id = $1 AND is_active = true',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const user = result.rows[0];

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    organization: user.organization,
                    createdAt: user.created_at,
                    lastLogin: user.last_login,
                },
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user information',
        });
    }
};
