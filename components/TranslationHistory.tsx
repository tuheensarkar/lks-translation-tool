import React, { useState, useEffect } from 'react';
import { Clock, Download, FileText, CheckCircle2, X, AlertCircle, Loader2, History } from '../components/ui/Icons';
import { useAuth } from '../contexts/AuthContext';
import AuthService from '../services/AuthService';

interface TranslationJob {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  documentType: string;
  originalFilename: string;
  translatedFilename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt: string | null;
  translatedFileUrl: string | null;
}

const TranslationHistory: React.FC = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTranslationHistory();
  }, []);

  const fetchTranslationHistory = async () => {
    try {
      setLoading(true);
      const token = AuthService.getAuthToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch translation history');
      }

      const data = await response.json();
      setJobs(data.data.jobs || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching translation history');
      console.error('Error fetching translation history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'failed':
        return <X size={16} className="text-red-600" />;
      case 'processing':
        return <Loader2 size={16} className="text-blue-600 animate-spin" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadFile = async (jobId: string, filename: string) => {
    try {
      const token = AuthService.getAuthToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/files/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download file');
      }

      // Create a blob from the response and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      alert('Failed to download file: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-lks-navy">Translation Archive</h2>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-lks-gold h-8 w-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl w-full mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-lks-navy">Translation Archive</h2>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle size={20} className="text-red-600 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-lks-navy">Translation Archive</h2>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No translation history</h3>
            <p className="text-gray-500">Your translated documents will appear here after you complete translations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Translation
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-lks-navy/10 rounded-lg flex items-center justify-center">
                          <FileText size={20} className="text-lks-navy" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {job.originalFilename}
                          </div>
                          <div className="text-sm text-gray-500">{job.documentType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {job.sourceLanguage} → {job.targetLanguage}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1 capitalize">{job.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {job.status === 'completed' && job.translatedFileUrl ? (
                        <button
                          onClick={() => job.id && job.translatedFilename && downloadFile(job.id, job.translatedFilename)}
                          className="text-lks-gold hover:text-lks-gold-light flex items-center"
                          title="Download translated file"
                        >
                          <Download size={16} className="mr-1" />
                          Download
                        </button>
                      ) : job.status === 'failed' ? (
                        <span className="text-gray-400">Unavailable</span>
                      ) : (
                        <span className="text-gray-400">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationHistory;