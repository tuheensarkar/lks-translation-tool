import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
};

// Registration validation rules
export const validateRegistration = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Name must be between 2 and 255 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    body('role')
        .optional()
        .isIn(['user', 'admin', 'client'])
        .withMessage('Role must be either "user", "admin", or "client"'),

    body('organization')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Organization name must not exceed 255 characters'),

    handleValidationErrors,
];

// Login validation rules
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors,
];

// Translation job validation rules
export const validateTranslationJob = [
    body('sourceLanguage')
        .trim()
        .notEmpty()
        .withMessage('Source language is required')
        .isLength({ min: 2, max: 10 })
        .withMessage('Invalid source language code'),

    body('targetLanguage')
        .trim()
        .notEmpty()
        .withMessage('Target language is required')
        .isLength({ min: 2, max: 10 })
        .withMessage('Invalid target language code'),

    body('documentType')
        .trim()
        .notEmpty()
        .withMessage('Document type is required')
        .isIn(['pdf', 'docx', 'xlsx', 'txt'])
        .withMessage('Document type must be one of: pdf, docx, xlsx, txt'),

    handleValidationErrors,
];
