import express from 'express';
import { signup, login, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', validateRegistration, signup);

/**
 * @route   POST /auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', validateLogin, login);

/**
 * @route   GET /auth/me
 * @desc    Get current user information
 * @access  Private
 */
router.get('/me', authenticate, me);

export default router;
