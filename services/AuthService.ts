import { User, LoginCredentials, RegisterData, JwtPayload } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://lks-translation-backend.onrender.com';

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

  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token
      this.setToken(data.data.token);

      return {
        user: data.data.user,
        token: data.data.token,
        message: data.message,
      };
    } catch (error: any) {
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
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token
      this.setToken(data.data.token);

      return {
        user: data.data.user,
        token: data.data.token,
        message: data.message,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }

  // Verify token and get user info
  async verifyToken(): Promise<JwtPayload | null> {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      const data = await response.json();

      return {
        userId: data.data.user.id,
        email: data.data.user.email,
        role: data.data.user.role,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
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
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      const data = await response.json();
      const user = data.data.user;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        password: '', // Don't return password
        role: user.role,
        organization: user.organization || '',
        createdAt: new Date(user.createdAt),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : new Date(),
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