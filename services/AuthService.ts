import { User, LoginCredentials, RegisterData, JwtPayload } from '../types/auth';

// Access environment variables
const getEnvVar = (name: string, fallback: string): string => {
  // @ts-ignore
  const value = import.meta?.env?.[name] || fallback;
  console.log(`Environment variable ${name}:`, value);
  return value;
};

// Development override - hardcoded for testing
const API_URL = 'http://20.20.20.205:5000';
const TRANSLATION_API_KEY = 'tr_api_1234567890abcdefghijklmnopqrstuvwxyz';

// Original code for reference:
// const API_URL = getEnvVar('VITE_API_URL', 'https://lks-translation-backend.onrender.com');
// const TRANSLATION_API_KEY = getEnvVar('VITE_TRANSLATION_API_KEY', 'tr_api_1234567890abcdefghijklmnopqrstuvwxyz');

interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  message: string;
}

class AuthService {
  // Get stored token
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Store token
  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // Remove token
  private removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Login user - Using translation service for authentication
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('AuthService.login called with:', credentials);
    try {
      // Create a mock translation request to validate credentials
      // In a real scenario, this would be a dedicated auth endpoint
      const formData = new FormData();
      
      // Create a small text file with credentials for validation
      const authText = `AUTH_REQUEST\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nPurpose: Authentication Validation`;
      const blob = new Blob([authText], { type: 'text/plain' });
      const authFile = new File([blob], 'auth_validation.txt', { type: 'text/plain' });
      
      formData.append('file', authFile);
      formData.append('sourceLanguage', 'en');
      formData.append('targetLanguage', 'en'); // Same language for auth
      formData.append('documentType', 'authentication');
      
      console.log('Making login request to:', `${API_URL}/api/process-translation`);
      console.log('Headers:', { 'X-API-Key': TRANSLATION_API_KEY });
      
      const response = await fetch(`${API_URL}/api/process-translation`, {
        method: 'POST',
        headers: {
          'X-API-Key': TRANSLATION_API_KEY
        },
        body: formData,
      });
      
      console.log('Login response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.log('Response not OK, throwing error');
        throw new Error(data.error || data.message || 'Authentication failed');
      }

      // Validate credentials (in production, backend would validate)
      if (!this.validateCredentials(credentials.email, credentials.password)) {
        throw new Error('Invalid email or password');
      }

      // Create JWT-like token
      const token = this.generateToken(credentials.email);
      this.setToken(token);

      // Create user object
      const user: User = {
        id: this.generateUserId(credentials.email),
        email: credentials.email,
        name: credentials.email.split('@')[0],
        password: '',
        role: 'client',
        organization: 'Lakshmi Sri',
        createdAt: new Date(),
        lastLogin: new Date()
      };

      return {
        user: user,
        token: token,
        message: 'Login successful',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }

  // Register new user - Using translation service for registration
  async register(userData: RegisterData): Promise<RegisterResponse> {
    // Validate password
    const passwordValidation = this.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    try {
      // Create a mock translation request to register user
      const formData = new FormData();
      
      // Create registration text file
      const regText = `REGISTRATION_REQUEST
Email: ${userData.email}
Name: ${userData.name}
Organization: ${userData.organization || 'Lakshmi Sri'}
Purpose: User Registration`;
      const blob = new Blob([regText], { type: 'text/plain' });
      const regFile = new File([blob], 'registration.txt', { type: 'text/plain' });
      
      formData.append('file', regFile);
      formData.append('sourceLanguage', 'en');
      formData.append('targetLanguage', 'en');
      formData.append('documentType', 'registration');
      
      console.log('Making registration request to:', `${API_URL}/api/process-translation`);
      console.log('Headers:', { 'X-API-Key': TRANSLATION_API_KEY });
      
      const response = await fetch(`${API_URL}/api/process-translation`, {
        method: 'POST',
        headers: {
          'X-API-Key': TRANSLATION_API_KEY
        },
        body: formData,
      });
      
      console.log('Registration response status:', response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      // Validate registration data
      if (!this.validateRegistration(userData)) {
        throw new Error('Invalid registration data');
      }

      // Create JWT-like token
      const token = this.generateToken(userData.email);
      this.setToken(token);

      // Create user object
      const user: User = {
        id: this.generateUserId(userData.email),
        email: userData.email,
        name: userData.name,
        password: '',
        role: 'client',
        organization: userData.organization || 'Lakshmi Sri',
        createdAt: new Date(),
        lastLogin: new Date()
      };

      return {
        user: user,
        token: token,
        message: 'Registration successful',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }

  // Validate credentials (simplified for demo)
  private validateCredentials(email: string, password: string): boolean {
    // In production, this would call the backend
    // For now, accept any non-empty credentials
    return email.length > 0 && password.length >= 8;
  }

  // Validate registration data
  private validateRegistration(userData: RegisterData): boolean {
    return (
      userData.email.length > 0 &&
      userData.name.length > 0 &&
      userData.password.length >= 8
    );
  }

  // Generate JWT-like token
  private generateToken(email: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      email: email,
      userId: this.generateUserId(email),
      role: 'client',
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    }));
    const signature = btoa('signature'); // Simplified signature
    return `${header}.${payload}.${signature}`;
  }

  // Generate user ID from email
  private generateUserId(email: string): string {
    return `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
  }

  // Parse JWT-like token
  private parseToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        exp: payload.exp
      };
    } catch (error) {
      return null;
    }
  }

  // Verify token and get user info
  async verifyToken(): Promise<JwtPayload | null> {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      // Parse token to get user info
      const decoded = this.parseToken(token);
      if (!decoded) {
        this.removeToken();
        return null;
      }

      // Check token expiration
      if (decoded.exp < Date.now()) {
        this.removeToken();
        return null;
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        exp: decoded.exp,
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      this.removeToken();
      return null;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      // Parse token to get user info
      const decoded = this.parseToken(token);
      if (!decoded) {
        this.removeToken();
        return null;
      }

      // Check token expiration
      if (decoded.exp < Date.now()) {
        this.removeToken();
        return null;
      }

      // Create user object from token data
      return {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.email.split('@')[0],
        password: '',
        role: decoded.role as 'admin' | 'client',
        organization: 'Lakshmi Sri',
        createdAt: new Date(decoded.exp - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        lastLogin: new Date(),
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      this.removeToken();
      return null;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    this.removeToken();
  }

  // Get auth token for API requests
  getAuthToken(): string | null {
    return this.getToken();
  }
}

export default new AuthService();