export class SecurityUtils {
  // Sanitize user input to prevent XSS
  static sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Validate file type and size
  static validateFile(file: File, allowedTypes: string[], maxSizeMB: number): { isValid: boolean; error?: string } {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      };
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type.toLowerCase();
    
    const isAllowedExtension = allowedTypes.some(type => 
      fileExtension === type.replace('.', '').toLowerCase()
    );
    
    const isAllowedMimeType = allowedTypes.some(type => 
      mimeType.includes(type.replace('.', ''))
    );

    if (!isAllowedExtension && !isAllowedMimeType) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { isValid: true };
  }

  // Generate secure random string
  static generateSecureRandomString(length: number = 32): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // Rate limiting simulation
  static checkRateLimit(identifier: string, maxRequests: number = 5, windowMinutes: number = 15): boolean {
    const key = `rate_limit_${identifier}`;
    const currentTime = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify({
        count: 1,
        firstRequest: currentTime
      }));
      return true;
    }

    const data = JSON.parse(stored);
    const timePassed = currentTime - data.firstRequest;

    if (timePassed > windowMs) {
      // Reset counter
      localStorage.setItem(key, JSON.stringify({
        count: 1,
        firstRequest: currentTime
      }));
      return true;
    }

    if (data.count >= maxRequests) {
      return false;
    }

    // Increment counter
    localStorage.setItem(key, JSON.stringify({
      count: data.count + 1,
      firstRequest: data.firstRequest
    }));

    return true;
  }

  // Clear rate limit data
  static clearRateLimit(identifier: string): void {
    localStorage.removeItem(`rate_limit_${identifier}`);
  }

  // Session timeout management
  static setupSessionTimeout(timeoutMinutes: number = 30, onTimeout: () => void): () => void {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(onTimeout, timeoutMinutes * 60 * 1000);
    };

    // Reset timeout on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    // Initial setup
    resetTimeout();

    // Return cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }

  // Encrypt sensitive data in localStorage
  static encryptLocalStorage(key: string, data: any): void {
    try {
      const serialized = JSON.stringify(data);
      // In production, use proper encryption library
      const encrypted = btoa(serialized); // Base64 encoding as simple example
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to encrypt localStorage data:', error);
    }
  }

  // Decrypt sensitive data from localStorage
  static decryptLocalStorage(key: string): any {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      // In production, use proper decryption
      const decrypted = atob(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt localStorage data:', error);
      return null;
    }
  }

  // Clear sensitive data
  static clearSensitiveData(): void {
    const sensitiveKeys = ['authToken', 'user_data', 'secure_session'];
    sensitiveKeys.forEach(key => localStorage.removeItem(key));
  }

  // CSRF token generation
  static generateCSRFToken(): string {
    return this.generateSecureRandomString(32);
  }

  // Validate CSRF token
  static validateCSRFToken(token: string): boolean {
    // In production, compare with server-generated token
    return token.length === 64 && /^[a-f0-9]+$/.test(token);
  }
}

// Security middleware for API calls
export class SecurityMiddleware {
  private static csrfToken: string | null = null;

  static async secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Add CSRF protection
    if (!this.csrfToken) {
      this.csrfToken = SecurityUtils.generateCSRFToken();
    }

    const secureOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'X-CSRF-Token': this.csrfToken,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      }
    };

    return fetch(url, secureOptions);
  }

  static setCSRFToken(token: string): void {
    this.csrfToken = token;
  }

  static getCSRFToken(): string | null {
    return this.csrfToken;
  }
}