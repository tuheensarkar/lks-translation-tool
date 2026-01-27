import AuthService from './AuthService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface TranslationRequest {
  documentType: string;
  sourceLanguage: string;
  targetLanguage: string;
  file: File;
}

interface TranslationResponse {
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

      const response = await fetch(`${API_URL}/api/process-translation`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Translation request failed');
      }

      return {
        jobId: data.data.jobId,
        status: data.data.status,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to submit translation request');
    }
  }

  // Get translation status
  async getTranslationStatus(jobId: string): Promise<TranslationResponse> {
    try {
      const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch job status');
      }

      const job = data.data.job;

      return {
        jobId: job.id,
        status: job.status,
        translatedFileUrl: job.translatedFileUrl,
        error: job.errorMessage,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to check translation status');
    }
  }

  // Get translation history
  async getTranslationHistory(limit: number = 50, offset: number = 0): Promise<TranslationJob[]> {
    try {
      const response = await fetch(`${API_URL}/api/jobs?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: this.getAuthHeader(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch translation history');
      }

      return data.data.jobs;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch translation history');
    }
  }

  // Download translated document
  async downloadTranslatedDocument(jobId: string, filename: string): Promise<void> {
    try {
      const token = AuthService.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/files/${jobId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Download failed');
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'translated_document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
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