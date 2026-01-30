import { User, LoginCredentials, RegisterData, JwtPayload } from '../types/auth';

// Access environment variables for Render authentication
const getEnvVar = (name: string, fallback: string): string => {
  // @ts-ignore
  const value = import.meta?.env?.[name] || fallback;
  console.log(`[RenderAuthService] Environment variable ${name}:`, value);
  return value;
};

const RENDER_AUTH_URL = getEnvVar('VITE_RENDER_AUTH_URL', 'https://lks-auth-service.onrender.com');
const RENDER_AUTH_API_KEY = getEnvVar('VITE_RENDER_AUTH_API_KEY', '2e3d1c8119481fde55b9980a8dae37c0f43b06b13c6bef7da0a6e97aa3ff8927');

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

class RenderAuthService {
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

  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    console.log('[RenderAuthService] Login attempt with:', credentials);
    try {
      const response = await fetch(`${RENDER_AUTH_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': RENDER_AUTH_API_KEY
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      console.log('[RenderAuthService] Login response status:', response.status);

      const data = await response.json();
      console.log('[RenderAuthService] Login response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Authentication failed');
      }

      // Store token
      if (data.token) {
        this.setToken(data.token);
      }

      return {
        user: data.user,
        token: data.token,
        message: data.message || 'Login successful',
      };
    } catch (error: any) {
      console.error('[RenderAuthService] Login error:', error);
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<RegisterResponse> {
    // Validate password
    const passwordValidation = this.validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    try {
      const response = await fetch(`${RENDER_AUTH_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': RENDER_AUTH_API_KEY
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          organization: userData.organization || 'Lakshmi Sri'
        }),
      });

      console.log('[RenderAuthService] Registration response status:', response.status);

      const data = await response.json();
      console.log('[RenderAuthService] Registration response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      // Store token
      if (data.token) {
        this.setToken(data.token);
      }

      return {
        user: data.user,
        token: data.token,
        message: data.message || 'Registration successful',
      };
    } catch (error: any) {
      console.error('[RenderAuthService] Registration error:', error);
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${RENDER_AUTH_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-API-Key': RENDER_AUTH_API_KEY
          },
        });
      }
    } catch (error) {
      console.error('[RenderAuthService] Logout error:', error);
      // Don't throw error on logout failure
    } finally {
      // Always remove local token
      this.removeToken();
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${RENDER_AUTH_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': RENDER_AUTH_API_KEY
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('[RenderAuthService] Get current user error:', error);
      // Remove invalid token
      this.removeToken();
      return null;
    }
  }

  // Verify token
  async verifyToken(): Promise<JwtPayload | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${RENDER_AUTH_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': RENDER_AUTH_API_KEY
        },
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      return data.payload;
    } catch (error) {
      console.error('[RenderAuthService] Token verification error:', error);
      // Remove invalid token
      this.removeToken();
      return null;
    }
  }

  // Get auth token
  getAuthToken(): string | null {
    return this.getToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Validate credentials (client-side validation)
  private validateCredentials(email: string, password: string): boolean {
    // Basic validation - in production, backend should handle this
    return email.length > 0 && password.length >= 8;
  }

  // Validate registration data
  private validateRegistration(userData: RegisterData): boolean {
    return (
      userData.email.length > 0 &&
      userData.password.length >= 8 &&
      userData.name.length > 0
    );
  }

  // Generate user ID (for mock purposes)
  private generateUserId(email: string): string {
    return `user_${email.split('@')[0]}_${Date.now()}`;
  }

  // Generate JWT-like token (for mock purposes)
  private generateToken(email: string): string {
    const payload = {
      userId: this.generateUserId(email),
      email: email,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    return btoa(JSON.stringify(payload));
  }
}

export default new RenderAuthService();