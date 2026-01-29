import AuthService from './AuthService';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_TRANSLATION_BACKEND_URL || 'https://lks-translation-backend.onrender.com';

interface TranslationRequest {
  documentType: string;
  sourceLanguage: string;
  targetLanguage: string;
  file: File;
}

interface TranslationResponse {
  progress: number;
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  translatedFileUrl?: string;
  error?: string;
}

interface TranslationJob {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  documentType: string;
  originalFilename: string;
  translatedFilename?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  translatedFileUrl?: string;
}

class TranslationService {
  // Get auth token
  private getAuthHeader(): { Authorization: string } {
    const token = AuthService.getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    return { Authorization: `Bearer ${token}` };
  }

  // Translate document
  async translateDocument(request: TranslationRequest): Promise<TranslationResponse> {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('sourceLanguage', request.sourceLanguage);
    formData.append('targetLanguage', request.targetLanguage);
    formData.append('documentType', request.documentType);

    // ✅ Use API key for authentication (not AuthService token)
    const apiKey = import.meta.env.VITE_TRANSLATION_API_KEY || 'tr_api_1234567890abcdefghijklmnopqrstuvwxyz';

    console.log(`[TranslationService] Sending translation request to: ${API_URL}/api/process-translation`);
    console.log(`[TranslationService] File: ${request.file.name}, Size: ${request.file.size} bytes`);

    const response = await fetch(`${API_URL}/api/process-translation`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey  // ✅ Changed to X-API-Key header as backend expects
      },
      // ✅ Don't set Content-Type - browser will set it with boundary for FormData
      body: formData,
    });

    console.log(`[TranslationService] Response status: ${response.status}`);

    // ✅ Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, read as text for error message
      const text = await response.text();
      console.error('[TranslationService] Non-JSON response:', text);
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}`);
    }

    console.log('[TranslationService] Response data:', data);

    if (!response.ok) {
      // ✅ Handle error response format
      const errorMsg = data.error || data.message || 'Translation request failed';
      throw new Error(errorMsg);
    }

    // ✅ Backend returns: { success: true, data: { jobId, status, progress } }
    const result = data.data || {};
    
    return {
      jobId: result.jobId,
      status: result.status,
      progress: result.progress || 0,
      translatedFileUrl: result.translatedFileUrl,
      error: data.error
    };
  } catch (error: any) {
    console.error('[TranslationService] Translation error:', error);
    throw new Error(error.message || 'Failed to submit translation request');
  }
}

  // Get translation status
  async getTranslationStatus(jobId: string): Promise<TranslationResponse> {
    try {
      // Use the external API endpoint for job status
      const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': import.meta.env.VITE_TRANSLATION_API_KEY || 'tr_api_1234567890abcdefghijklmnopqrstuvwxyz'
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch job status');
      }

      // Align with external API response format
      // Backend returns: { success: true, data: { job: { ... } } }
      const job = data.data?.job || {};
      
      return {
        jobId: job.id || jobId,
        status: job.status,
        progress: job.progress || 0,
        translatedFileUrl: job.translatedFileUrl,
        error: job.errorMessage || job.error,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to check translation status');
    }
  }

  // Get translation history
  async getTranslationHistory(limit: number = 50, offset: number = 0): Promise<TranslationJob[]> {
    try {
      // Use the external API endpoint for translation history
      const response = await fetch(`${API_URL}/api/jobs?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
          'X-API-Key': import.meta.env.VITE_TRANSLATION_API_KEY || 'tr_api_1234567890abcdefghijklmnopqrstuvwxyz'
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch translation history');
      }

      // Map external API response to TranslationJob interface
      return data.jobs?.map((job: any) => ({
        id: job.jobId,
        sourceLanguage: job.sourceLanguage,
        targetLanguage: job.targetLanguage,
        documentType: job.documentType,
        originalFilename: job.originalFilename,
        translatedFilename: job.translatedFilename,
        status: job.status,
        errorMessage: job.error,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        translatedFileUrl: job.translatedFileUrl,
      })) || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch translation history');
    }
  }

  // Download translated document
  async downloadTranslatedDocument(translatedFileUrl: string, filename: string): Promise<void> {
  try {
    // Construct full URL if relative
    const fullUrl = translatedFileUrl.startsWith('http') 
      ? translatedFileUrl 
      : `${API_URL}${translatedFileUrl.startsWith('/') ? '' : '/'}${translatedFileUrl}`;

    console.log(`[Frontend] Starting download from URL: ${fullUrl}`);
    
    // ✅ Use the fullUrl
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
          'X-API-Key': import.meta.env.VITE_TRANSLATION_API_KEY || 'tr_api_1234567890abcdefghijklmnopqrstuvwxyz'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Frontend] Download request failed:', errorText);
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    console.log('[Frontend] Download response received, converting to blob...');
    
    // Try to extract filename from Content-Disposition header first
    let downloadFilename = filename || 'translated_document';
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        // Remove quotes if present
        downloadFilename = filenameMatch[1].replace(/['"]/g, '');
        console.log(`[Frontend] Extracted filename from header: ${downloadFilename}`);
      }
    }
    
    // Create blob from response
    const blob = await response.blob();
    console.log(`[Frontend] Blob created (Size: ${blob.size} bytes, Type: ${blob.type}). Triggering browser download...`);

    // Create download link with correct filename
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log(`[Frontend] Download triggered successfully with filename: ${downloadFilename}`);
  } catch (error: any) {
    console.error('[Frontend] Download error:', error.message);
    throw new Error(error.message || 'Failed to download translated document');
  }
}

  // Poll for job completion
  async pollJobStatus(
    jobId: string,
    onUpdate: (status: TranslationResponse) => void,
    maxAttempts: number = 60,
    intervalMs: number = 2000
  ): Promise<TranslationResponse> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          attempts++;
          const status = await this.getTranslationStatus(jobId);
          onUpdate(status);

          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(interval);
            resolve(status);
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('Translation timeout: Job took too long to complete'));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, intervalMs);
    });
  }
}

export default new TranslationService();