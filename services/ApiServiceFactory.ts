// ApiServiceFactory.ts - Factory for routing API requests to appropriate services

export class ApiServiceFactory {
  // Determine which service to use based on the endpoint
  static getServiceForEndpoint(endpoint: string): 'auth' | 'translation' | 'other' {
    // Authentication endpoints
    if (endpoint.includes('/auth/') || 
        endpoint.includes('/login') || 
        endpoint.includes('/register') || 
        endpoint.includes('/logout') ||
        endpoint.includes('/verify') ||
        endpoint.includes('/me')) {
      return 'auth';
    }
    
    // Translation endpoints
    if (endpoint.includes('/process-translation') || 
        endpoint.includes('/jobs') || 
        endpoint.includes('/download') ||
        endpoint.includes('/translation')) {
      return 'translation';
    }
    
    // All other endpoints go to company backend
    return 'other';
  }

  // Get the appropriate base URL for the service
  static getBaseUrl(serviceType: 'auth' | 'translation' | 'other'): string {
    switch (serviceType) {
      case 'auth':
        return import.meta.env.VITE_RENDER_AUTH_URL || 'https://lks-translation-frontend.onrender.com';
      case 'translation':
        return import.meta.env.VITE_TRANSLATION_BACKEND_URL || 'http://20.20.20.205:5000';
      case 'other':
        // Default to company backend for other services
        return import.meta.env.VITE_TRANSLATION_BACKEND_URL || 'http://20.20.20.205:5000';
      default:
        return import.meta.env.VITE_TRANSLATION_BACKEND_URL || 'http://20.20.20.205:5000';
    }
  }

  // Get the appropriate API key for the service
  static getApiKey(serviceType: 'auth' | 'translation' | 'other'): string {
    switch (serviceType) {
      case 'auth':
        return import.meta.env.VITE_RENDER_AUTH_API_KEY || 'render_auth_key_123';
      case 'translation':
      case 'other':
        return import.meta.env.VITE_TRANSLATION_API_KEY || 'tr_api_1234567890abcdefghijklmnopqrstuvwxyz';
      default:
        return import.meta.env.VITE_TRANSLATION_API_KEY || 'tr_api_1234567890abcdefghijklmnopqrstuvwxyz';
    }
  }

  // Build full URL with proper base URL
  static buildUrl(endpoint: string): string {
    const serviceType = this.getServiceForEndpoint(endpoint);
    const baseUrl = this.getBaseUrl(serviceType);
    
    // Remove leading slash if present to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    return `${baseUrl}/${cleanEndpoint}`;
  }

  // Build headers with appropriate authentication
  static buildHeaders(serviceType: 'auth' | 'translation' | 'other', authToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'X-API-Key': this.getApiKey(serviceType)
    };

    // Add Authorization header for authenticated requests to auth service
    if (serviceType === 'auth' && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
  }

  // Enhanced fetch wrapper that automatically routes to correct service
  static async fetch(endpoint: string, options: RequestInit = {}, authToken?: string): Promise<Response> {
    const serviceType = this.getServiceForEndpoint(endpoint);
    const fullUrl = this.buildUrl(endpoint);
    const headers = this.buildHeaders(serviceType, authToken);

    console.log(`[ApiServiceFactory] Routing ${options.method || 'GET'} request to ${serviceType} service:`, fullUrl);

    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    };

    return await fetch(fullUrl, fetchOptions);
  }
}

// Convenience methods for common operations
export class ApiHelpers {
  static async get(endpoint: string, authToken?: string): Promise<Response> {
    return ApiServiceFactory.fetch(endpoint, { method: 'GET' }, authToken);
  }

  static async post(endpoint: string, data: any, authToken?: string): Promise<Response> {
    return ApiServiceFactory.fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, authToken);
  }

  static async postFormData(endpoint: string, formData: FormData, authToken?: string): Promise<Response> {
    return ApiServiceFactory.fetch(endpoint, {
      method: 'POST',
      body: formData
    }, authToken);
  }

  static async put(endpoint: string, data: any, authToken?: string): Promise<Response> {
    return ApiServiceFactory.fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, authToken);
  }

  static async delete(endpoint: string, authToken?: string): Promise<Response> {
    return ApiServiceFactory.fetch(endpoint, { method: 'DELETE' }, authToken);
  }
}

export default ApiServiceFactory;