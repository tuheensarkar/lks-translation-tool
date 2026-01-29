import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Download, ArrowRight, History, FileText, Languages, ShieldCheck } from './ui/Icons';
import { ProcessingStatus, TranslationState } from '../types';
import { DOCUMENT_TYPES, LANGUAGES } from '../constants';
import TranslationHistory from './TranslationHistory';
import TranslationService from '../services/TranslationService';

interface StatusFeedbackProps {
  state: TranslationState;
  onReset: () => void;
  onViewHistory?: () => void;
}

const StatusFeedback: React.FC<StatusFeedbackProps> = ({ state, onReset, onViewHistory }) => {
  const { status, progress, errorMessage, file, docType, sourceLang, targetLang, translatedFileUrl } = state;  // ✅ Added translatedFileUrl
  const [isDownloading, setIsDownloading] = useState(false);  // ✅ Added download state

  // ✅ Added download handler function
  const handleDownload = async () => {
    if (!translatedFileUrl || !file) return;
    
    setIsDownloading(true);
    try {
      // Extract filename from original file and create translated filename
      // Note: PDFs and images are converted to .docx by the translator
      const originalName = file.name;
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      const originalExt = originalName.substring(originalName.lastIndexOf('.')).toLowerCase() || '';
      
      // Determine correct extension based on document type
      // PDFs and images generate Word documents, so use .docx
      let ext = originalExt;
      const docTypeLower = (docType || '').toLowerCase();
      if (docTypeLower === 'pdf' || 
          docTypeLower === 'image' || 
          originalExt === '.pdf' ||
          ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'].includes(originalExt)) {
        ext = '.docx';
      }
      
      const translatedFilename = `${nameWithoutExt}_translated${ext}`;
      
      // The backend will set the correct filename in Content-Disposition header,
      // but we provide a fallback filename here
      await TranslationService.downloadTranslatedDocument(translatedFileUrl, translatedFilename);
    } catch (error: any) {
      console.error('[StatusFeedback] Download error:', error);
      alert(`Download failed: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (status === 'idle') return null;

  const sourceLangName = LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;
  const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;

  return (
    <div className="mt-8 animate-fade-in">
      
      {/* Uploading & Processing State - Card Style */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-lks-navy px-6 py-4 border-b border-lks-navyLight">
             <h3 className="text-white font-serif text-lg tracking-wide">Processing Document</h3>
          </div>
          <div className="p-8">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <Loader2 className="animate-spin text-lks-gold h-16 w-16" strokeWidth={1.5} />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-lks-navy">
                  {status === 'processing' ? Math.min(progress, 100) : progress}%
                </div>
              </div>
              
              <div>
                <h4 className="text-xl font-serif text-lks-navy font-medium mb-2">
                  {status === 'uploading' ? 'Secure Upload in Progress' : 'Translating & Converting'}
                </h4>
                <p className="text-gray-500 max-w-md mx-auto">
                  {status === 'processing' 
                    ? 'Our AI engine is analyzing legal terminology and preserving document formatting...' 
                    : 'Establishing encrypted tunnel for bank-grade secure file transfer...'}
                </p>
              </div>

              <div className="w-full max-w-lg bg-gray-100 rounded-full h-1.5 mt-4">
                <div 
                  className="bg-lks-gold h-1.5 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(201,169,97,0.5)]"
                  style={{ width: `${status === 'processing' ? Math.min(progress, 100) : progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success State - Hero Card Style */}
      {status === 'completed' && (
        <div className="space-y-6">
          {/* Main Success Card */}
          <div className="bg-navy-gradient rounded-xl shadow-xl overflow-hidden text-white relative border border-lks-gold/30">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-pattern opacity-20 pointer-events-none"></div>
            
            <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0">
                <div className="h-20 w-20 bg-lks-gold/20 rounded-2xl flex items-center justify-center border border-lks-gold text-lks-gold shadow-[0_0_20px_rgba(201,169,97,0.2)]">
                  <CheckCircle2 size={40} strokeWidth={2} />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-serif font-medium text-white mb-3">
                  Translation Completed
                </h3>
                <p className="text-blue-100 leading-relaxed max-w-2xl">
                  Your document has been professionally translated with the highest standards of accuracy and precision. The converted file maintains original formatting and is ready for immediate use.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <button 
                    onClick={handleDownload}  // ✅ Added onClick handler
                    disabled={isDownloading || !translatedFileUrl}  // ✅ Added disabled state
                    className="flex items-center justify-center space-x-2 bg-lks-gold text-lks-navy px-6 py-3 rounded-md hover:bg-lks-goldLight transition-all shadow-lg font-semibold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"  // ✅ Added disabled styles
                  >
                    <Download size={18} />
                    <span>{isDownloading ? 'Downloading...' : 'Download Document'}</span>  
                  </button>
                  <div className="h-12 px-4 bg-white/10 rounded-md border border-white/20 flex items-center min-w-[200px]">
                    <span className="text-sm text-blue-100 truncate">
                      Translated_{file?.name || 'document'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-lks-navy/5 rounded text-lks-navy"><FileText size={20} /></div>
                <h4 className="font-serif font-bold text-lks-navy">Document</h4>
              </div>
              <div className="mt-auto">
                <p className="text-sm font-medium text-gray-900 truncate">{file?.name}</p>
                <p className="text-xs text-gray-500">{file ? (file.size / 1024).toFixed(2) : 0} KB</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-lks-navy/5 rounded text-lks-navy"><Languages size={20} /></div>
                <h4 className="font-serif font-bold text-lks-navy">Translation</h4>
              </div>
              <div className="mt-auto">
                <p className="text-sm font-medium text-gray-900">{sourceLangName} → {targetLangName}</p>
                <p className="text-xs text-gray-500">Professional Grade</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-lks-navy/5 rounded text-lks-navy"><ShieldCheck size={20} /></div>
                <h4 className="font-serif font-bold text-lks-navy">Security</h4>
              </div>
              <div className="mt-auto">
                <p className="text-sm font-medium text-gray-900">Encrypted Transfer</p>
                <p className="text-xs text-gray-500">End-to-end Protected</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h4 className="font-serif text-lg font-bold text-lks-navy mb-6">Next Steps</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={onReset}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-lks-gold hover:bg-lks-gold/5 transition-all group text-left"
              >
                <div className="p-2 bg-gray-100 rounded text-gray-500 group-hover:bg-white group-hover:text-lks-gold mr-4">
                  <ArrowRight size={20} />
                </div>
                <div>
                  <p className="font-medium text-lks-navy">Translate Another Document</p>
                  <p className="text-xs text-gray-500">Begin a new translation project</p>
                </div>
              </button>
              
              <button 
                onClick={() => window.location.href = '/history'}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-lks-gold hover:bg-lks-gold/5 transition-all group text-left"
              >
                <div className="p-2 bg-gray-100 rounded text-gray-500 group-hover:bg-white group-hover:text-lks-gold mr-4">
                  <History size={20} />
                </div>
                <div>
                  <p className="font-medium text-lks-navy">View Translation Archive</p>
                  <p className="text-xs text-gray-500">Access your translation history</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-red-900">Conversion Failed</h3>
              <p className="mt-1 text-sm text-red-700">
                {errorMessage || "An unexpected error occurred during the process. Please try again."}
              </p>
              <div className="mt-4">
                 <button 
                  onClick={onReset}
                  className="text-red-800 hover:text-red-900 font-medium text-sm underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusFeedback;