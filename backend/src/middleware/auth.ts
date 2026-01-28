import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};

// Authentication middleware
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please authenticate.',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please login again.',
            });
        }

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Authentication failed.',
        });
    }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated.',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource.',
            });
        }

        next();
    };
};

// X-API-Key authentication middleware
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.TRANSLATION_API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Invalid API key'
        });
    }
    
    next();
};
